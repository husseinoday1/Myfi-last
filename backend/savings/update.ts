import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { SavingGoal, UpdateSavingGoalRequest } from "./types";
import { logAudit } from "../audit/log";

// Updates a saving goal.
export const update = api<UpdateSavingGoalRequest, SavingGoal>(
  { auth: true, expose: true, method: "PUT", path: "/savings/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const existing = await db.queryRow<{
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
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (!existing) {
      throw APIError.notFound("Saving goal not found");
    }

    const name = req.name?.trim() ?? existing.name;
    const targetAmount = req.targetAmount ?? existing.target_amount;
    const status = req.status ?? existing.status;
    const targetDate = req.targetDate !== undefined ? req.targetDate : existing.target_date;

    if (targetAmount <= 0) {
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
      UPDATE saving_goals
      SET name = ${name}, target_amount = ${targetAmount}, status = ${status}, target_date = ${targetDate}
      WHERE id = ${req.id} AND user_id = ${auth.userID}
      RETURNING id, user_id, name, target_amount, saved_amount, start_date, target_date, status, created_at
    `;

    if (!row) {
      throw APIError.internal("Failed to update saving goal");
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

    await logAudit(auth.userID, "saving_goal", goal.id, "update", goal, {
      id: existing.id,
      userId: existing.user_id,
      name: existing.name,
      targetAmount: existing.target_amount,
      savedAmount: existing.saved_amount,
      startDate: existing.start_date,
      targetDate: existing.target_date,
      status: existing.status as "active" | "completed" | "cancelled",
      createdAt: existing.created_at,
    });

    return goal;
  }
);
