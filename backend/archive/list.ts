import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { MonthlyArchive } from "./types";

export interface ListArchivesResponse {
  archives: MonthlyArchive[];
}

// Retrieves all monthly archives for the authenticated user.
export const list = api<void, ListArchivesResponse>(
  { auth: true, expose: true, method: "GET", path: "/archives" },
  async () => {
    const auth = getAuthData()!;

    const rows = await db.queryAll<{
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
      SELECT id, user_id, month, year, total_income, total_expenses, total_savings,
             debts_remaining, carryover_in, carryover_out, created_at
      FROM monthly_archives
      WHERE user_id = ${auth.userID}
      ORDER BY year DESC, month DESC
    `;

    const archives: MonthlyArchive[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      month: row.month,
      year: row.year,
      totalIncome: row.total_income,
      totalExpenses: row.total_expenses,
      totalSavings: row.total_savings,
      debtsRemaining: row.debts_remaining,
      carryoverIn: row.carryover_in,
      carryoverOut: row.carryover_out,
      createdAt: row.created_at,
    }));

    return { archives };
  }
);
