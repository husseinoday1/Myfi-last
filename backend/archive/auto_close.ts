import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";
import db from "../db";
import { logAudit } from "../audit/log";
import type { MonthlyArchive } from "./types";

async function autoCloseMonthHandler(): Promise<void> {
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const users = await db.queryAll<{ user_id: string }>`
    SELECT DISTINCT user_id FROM transactions
  `;

  for (const user of users) {
    try {
      await closeMonthForUser(user.user_id, prevMonth, prevYear);
    } catch (err) {
      console.error(`Failed to auto-close month for user ${user.user_id}:`, err);
    }
  }
}

export const autoCloseMonthEndpoint = api(
  { method: "POST", path: "/archive/auto-close", expose: false },
  autoCloseMonthHandler
);

export const autoCloseMonth = new CronJob("auto-close-month", {
  title: "Auto Close Previous Month",
  schedule: "0 1 1 * *",
  endpoint: autoCloseMonthEndpoint,
});

async function closeMonthForUser(
  userId: string,
  month: number,
  year: number
): Promise<void> {
  await using tx = await db.begin();

  const existing = await tx.queryRow<{ id: number }>`
    SELECT id FROM monthly_archives
    WHERE user_id = ${userId} AND month = ${month} AND year = ${year}
  `;

  if (existing) {
    return;
  }

  const totals = await tx.queryRow<{
    total_income: number | null;
    total_expenses: number | null;
  }>`
    SELECT
      SUM(CASE WHEN type IN ('income', 'carryover') THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
    FROM transactions
    WHERE user_id = ${userId}
      AND EXTRACT(MONTH FROM date) = ${month}
      AND EXTRACT(YEAR FROM date) = ${year}
  `;

  const totalIncome = totals?.total_income ?? 0;
  const totalExpenses = totals?.total_expenses ?? 0;

  const savings = await tx.queryRow<{ total_savings: number | null }>`
    SELECT SUM(st.amount) as total_savings
    FROM saving_transactions st
    WHERE st.saving_id IN (SELECT id FROM saving_goals WHERE user_id = ${userId})
      AND EXTRACT(MONTH FROM st.date) = ${month}
      AND EXTRACT(YEAR FROM st.date) = ${year}
  `;

  const totalSavings = savings?.total_savings ?? 0;

  const debts = await tx.queryRow<{ debts_remaining: number | null }>`
    SELECT SUM(total_amount - paid_amount) as debts_remaining
    FROM debts
    WHERE user_id = ${userId} AND status = 'active'
  `;

  const debtsRemaining = debts?.debts_remaining ?? 0;

  const carryoverIn = await tx.queryRow<{ amount: number | null }>`
    SELECT amount FROM transactions
    WHERE user_id = ${userId}
      AND type = 'carryover'
      AND EXTRACT(MONTH FROM date) = ${month}
      AND EXTRACT(YEAR FROM date) = ${year}
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
    VALUES (${userId}, ${month}, ${year}, ${totalIncome}, ${totalExpenses}, ${totalSavings}, ${debtsRemaining}, ${carryoverInAmount}, ${carryoverOut})
    RETURNING id, user_id, month, year, total_income, total_expenses, total_savings, debts_remaining, carryover_in, carryover_out, created_at
  `;

  if (!archive) {
    throw new Error("Failed to create archive");
  }

  if (carryoverOut > 0) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthDate = new Date(nextYear, nextMonth - 1, 1);

    await tx.exec`
      INSERT INTO transactions (user_id, type, amount, description, date)
      VALUES (${userId}, 'carryover', ${carryoverOut}, 'Carryover from previous month', ${nextMonthDate})
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

  await logAudit(userId, "monthly_archive", result.id, "create", result);
}
