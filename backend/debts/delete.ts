import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { logAudit } from "../audit/log";

export interface DeleteDebtRequest {
  id: number;
}

// Deletes a debt and all related payments.
export const deleteDebt = api<DeleteDebtRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/debts/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const existing = await db.queryRow<{
      id: number;
      user_id: string;
      name: string;
      total_amount: number;
      paid_amount: number;
      status: string;
      date_taken: Date;
      due_date: Date | null;
      created_at: Date;
    }>`
      SELECT id, user_id, name, total_amount, paid_amount, status, date_taken, due_date, created_at
      FROM debts
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (!existing) {
      throw APIError.notFound("Debt not found");
    }

    await db.exec`
      DELETE FROM debts
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    await logAudit(auth.userID, "debt", req.id, "delete", null, {
      id: existing.id,
      userId: existing.user_id,
      name: existing.name,
      totalAmount: existing.total_amount,
      paidAmount: existing.paid_amount,
      status: existing.status,
      dateTaken: existing.date_taken,
      dueDate: existing.due_date,
      createdAt: existing.created_at,
    });
  }
);
