import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { MonthlyArchive } from "./types";
import { logAudit } from "../audit/log";

export interface CloseMonthRequest {
  month: number;
  year: number;
}

// Closes a month, creating an archive and carrying over the balance to the next month.
export const closeMonth = api<CloseMonthRequest, MonthlyArchive>(
  { auth: true, expose: true, method: "POST", path: "/archives/close" },
  async (req) => {
    const auth = getAuthData()!;

    if (req.month < 1 || req.month > 12) {
      throw APIError.invalidArgument("Invalid month");
    }

    await using tx = await db.begin();

    const existing = await tx.queryRow<{ id: number }>`
      SELECT id FROM monthly_archives
      WHERE user_id = ${auth.userID} AND month = ${req.month} AND year = ${req.year}
    `;

    if (existing) {
      throw APIError.alreadyExists("Month already closed");
    }

    const totals = await tx.queryRow<{
      total_income: number | null;
      total_expenses: number | null;
    }>`
      SELECT
        SUM(CASE WHEN type IN ('income', 'carryover') THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
      FROM transactions
      WHERE user_id = ${auth.userID}
        AND EXTRACT(MONTH FROM date) = ${req.month}
        AND EXTRACT(YEAR FROM date) = ${req.year}
    `;

    const totalIncome = totals?.total_income ?? 0;
    const totalExpenses = totals?.total_expenses ?? 0;

    const savings = await tx.queryRow<{ total_savings: number | null }>`
      SELECT SUM(st.amount) as total_savings
      FROM saving_transactions st
      WHERE st.saving_id IN (SELECT id FROM saving_goals WHERE user_id = ${auth.userID})
        AND EXTRACT(MONTH FROM st.date) = ${req.month}
        AND EXTRACT(YEAR FROM st.date) = ${req.year}
    `;

    const totalSavings = savings?.total_savings ?? 0;

    const debts = await tx.queryRow<{ debts_remaining: number | null }>`
      SELECT SUM(total_amount - paid_amount) as debts_remaining
      FROM debts
      WHERE user_id = ${auth.userID} AND status = 'active'
    `;

    const debtsRemaining = debts?.debts_remaining ?? 0;

    const carryoverIn = await tx.queryRow<{ amount: number | null }>`
      SELECT amount FROM transactions
      WHERE user_id = ${auth.userID}
        AND type = 'carryover'
        AND EXTRACT(MONTH FROM date) = ${req.month}
        AND EXTRACT(YEAR FROM date) = ${req.year}
    `;

    const carryoverInAmount = carryoverIn?.amount ?? 0;

    const balance = totalIncome - totalExpenses;
    const carryoverOut = balance > 0 ? balance : 0;

    const archive = await tx.queryRow<{
      id: number;
      user_id: string;
      month: number;
      year: number;
      total_income: number;
      total_expenses: number;
      total_savings: number;
      debts_remaining: number;
      carryover_in: number;
      carryover_out: number;
      created_at: Date;
    }>`
      INSERT INTO monthly_archives (user_id, month, year, total_income, total_expenses, total_savings, debts_remaining, carryover_in, carryover_out)
      VALUES (${auth.userID}, ${req.month}, ${req.year}, ${totalIncome}, ${totalExpenses}, ${totalSavings}, ${debtsRemaining}, ${carryoverInAmount}, ${carryoverOut})
      RETURNING id, user_id, month, year, total_income, total_expenses, total_savings, debts_remaining, carryover_in, carryover_out, created_at
    `;

    if (!archive) {
      throw APIError.internal("Failed to create archive");
    }

    if (carryoverOut > 0) {
      const nextMonth = req.month === 12 ? 1 : req.month + 1;
      const nextYear = req.month === 12 ? req.year + 1 : req.year;
      const nextMonthDate = new Date(nextYear, nextMonth - 1, 1);

      await tx.exec`
        INSERT INTO transactions (user_id, type, amount, description, date)
        VALUES (${auth.userID}, 'carryover', ${carryoverOut}, 'Carryover from previous month', ${nextMonthDate})
      `;
    }

    await tx.commit();

    const result: MonthlyArchive = {
      id: archive.id,
      userId: archive.user_id,
      month: archive.month,
      year: archive.year,
      totalIncome: archive.total_income,
      totalExpenses: archive.total_expenses,
      totalSavings: archive.total_savings,
      debtsRemaining: archive.debts_remaining,
      carryoverIn: archive.carryover_in,
      carryoverOut: archive.carryover_out,
      createdAt: archive.created_at,
    };

    await logAudit(auth.userID, "monthly_archive", result.id, "create", result);

    return result;
  }
);
