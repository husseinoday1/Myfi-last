import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { SavingGoal, CreateSavingGoalRequest } from "./types";
import { logAudit } from "../audit/log";

// Creates a new saving goal.
export const create = api<CreateSavingGoalRequest, SavingGoal>(
  { auth: true, expose: true, method: "POST", path: "/savings" },
  async (req) => {
    const auth = getAuthData()!;

    if (!req.name.trim()) {
      throw APIError.invalidArgument("Goal name is required");
    }

    if (req.targetAmount <= 0) {
      throw APIError.invalidArgument("Target amount must be positive");
    }

    const row = await db.queryRow<{
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
      INSERT INTO saving_goals (user_id, name, target_amount, start_date, target_date)
      VALUES (${auth.userID}, ${req.name.trim()}, ${req.targetAmount}, ${req.startDate}, ${req.targetDate ?? null})
      RETURNING id, user_id, name, target_amount, saved_amount, start_date, target_date, status, created_at
    `;

    if (!row) {
      throw APIError.internal("Failed to create saving goal");
    }

    const goal: SavingGoal = {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      targetAmount: row.target_amount,
      savedAmount: row.saved_amount,
      startDate: row.start_date,
      targetDate: row.target_date,
      status: row.status as "active" | "completed" | "cancelled",
      createdAt: row.created_at,
    };

    await logAudit(auth.userID, "saving_goal", goal.id, "create", goal);

    return goal;
  }
);
