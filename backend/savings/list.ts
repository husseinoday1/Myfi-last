import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { SavingGoal } from "./types";

export interface ListSavingGoalsResponse {
  goals: SavingGoal[];
}

// Retrieves all saving goals for the authenticated user.
export const list = api<void, ListSavingGoalsResponse>(
  { auth: true, expose: true, method: "GET", path: "/savings" },
  async () => {
    const auth = getAuthData()!;

    const rows = await db.queryAll<{
      id: number;
      user_id: string;
      name: string;
      target_amount: number;
      saved_amount: number;
      start_date: Date;
      target_date: Date | null;
      status: string;
      created_at: Date;
    }>`
      SELECT id, user_id, name, target_amount, saved_amount, start_date, target_date, status, created_at
      FROM saving_goals
      WHERE user_id = ${auth.userID}
      ORDER BY start_date DESC
    `;

    const goals: SavingGoal[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      targetAmount: row.target_amount,
      savedAmount: row.saved_amount,
      startDate: row.start_date,
      targetDate: row.target_date,
      status: row.status as "active" | "completed" | "cancelled",
      createdAt: row.created_at,
    }));

    return { goals };
  }
);
