import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { logAudit } from "../audit/log";

export interface DeleteSavingGoalRequest {
  id: number;
}

// Deletes a saving goal and all related transactions.
export const deleteSavingGoal = api<DeleteSavingGoalRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/savings/:id" },
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

    await db.exec`
      DELETE FROM saving_goals
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    await logAudit(auth.userID, "saving_goal", req.id, "delete", null, {
      id: existing.id,
      userId: existing.user_id,
      name: existing.name,
      targetAmount: existing.target_amount,
      savedAmount: existing.saved_amount,
      startDate: existing.start_date,
      targetDate: existing.target_date,
      status: existing.status,
      createdAt: existing.created_at,
    });
  }
);
