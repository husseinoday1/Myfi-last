import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { MonthlyArchive } from "./types";
import { logAudit } from "../audit/log";

export interface RegenerateArchiveRequest {
  id: number;
}

// Regenerates a monthly archive with current data.
export const regenerateArchive = api<RegenerateArchiveRequest, MonthlyArchive>(
  { auth: true, expose: true, method: "POST", path: "/archives/:id/regenerate" },
  async (req) => {
    const auth = getAuthData()!;

    await using tx = await db.begin();

    const existingArchive = await tx.queryRow<{
      id: number;
      user_id: string;
      month: number;
      year: number;
      carryover_out: number;
    }>`
      SELECT id, user_id, month, year, carryover_out
      FROM monthly_archives
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (!existingArchive) {
      throw APIError.notFound("Archive not found");
    }

    const month = existingArchive.month;
    const year = existingArchive.year;

    const totals = await tx.queryRow<{
      total_income: number | null;
      total_expenses: number | null;
    }>`
      SELECT
        SUM(CASE WHEN type IN ('income', 'carryover') THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
      FROM transactions
      WHERE user_id = ${auth.userID}
        AND EXTRACT(MONTH FROM date) = ${month}
        AND EXTRACT(YEAR FROM date) = ${year}
    `;

    const totalIncome = totals?.total_income ?? 0;
    const totalExpenses = totals?.total_expenses ?? 0;

    const savings = await tx.queryRow<{ total_savings: number | null }>`
      SELECT SUM(st.amount) as total_savings
      FROM saving_transactions st
      WHERE st.saving_id IN (SELECT id FROM saving_goals WHERE user_id = ${auth.userID})
        AND EXTRACT(MONTH FROM st.date) = ${month}
        AND EXTRACT(YEAR FROM st.date) = ${year}
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
        AND EXTRACT(MONTH FROM date) = ${month}
        AND EXTRACT(YEAR FROM date) = ${year}
    `;

    const carryoverInAmount = carryoverIn?.amount ?? 0;

    const balance = totalIncome - totalExpenses;
    const carryoverOut = balance > 0 ? balance : 0;

    if (existingArchive.carryover_out > 0 && carryoverOut !== existingArchive.carryover_out) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;

      await tx.exec`
        DELETE FROM transactions
        WHERE user_id = ${auth.userID}
          AND type = 'carryover'
          AND EXTRACT(MONTH FROM date) = ${nextMonth}
          AND EXTRACT(YEAR FROM date) = ${nextYear}
          AND amount = ${existingArchive.carryover_out}
          AND description = 'Carryover from previous month'
      `;
    }

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
      UPDATE monthly_archives
      SET total_income = ${totalIncome},
          total_expenses = ${totalExpenses},
          total_savings = ${totalSavings},
          debts_remaining = ${debtsRemaining},
          carryover_in = ${carryoverInAmount},
          carryover_out = ${carryoverOut}
      WHERE id = ${req.id} AND user_id = ${auth.userID}
      RETURNING id, user_id, month, year, total_income, total_expenses, total_savings, debts_remaining, carryover_in, carryover_out, created_at
    `;

    if (!archive) {
      throw APIError.internal("Failed to update archive");
    }

    if (carryoverOut > 0) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const nextMonthDate = new Date(nextYear, nextMonth - 1, 1);

      const existingCarryover = await tx.queryRow<{ id: number }>`
        SELECT id FROM transactions
        WHERE user_id = ${auth.userID}
          AND type = 'carryover'
          AND EXTRACT(MONTH FROM date) = ${nextMonth}
          AND EXTRACT(YEAR FROM date) = ${nextYear}
          AND description = 'Carryover from previous month'
      `;

      if (existingCarryover) {
        await tx.exec`
          UPDATE transactions
          SET amount = ${carryoverOut}
          WHERE id = ${existingCarryover.id}
        `;
      } else {
        await tx.exec`
          INSERT INTO transactions (user_id, type, amount, description, date)
          VALUES (${auth.userID}, 'carryover', ${carryoverOut}, 'Carryover from previous month', ${nextMonthDate})
        `;
      }
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

    await logAudit(auth.userID, "monthly_archive", result.id, "update", result);

    return result;
  }
);
