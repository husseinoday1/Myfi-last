import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Debt, UpdateDebtRequest } from "./types";
import { logAudit } from "../audit/log";

// Updates a debt.
export const update = api<UpdateDebtRequest, Debt>(
  { auth: true, expose: true, method: "PUT", path: "/debts/:id" },
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

    const name = req.name?.trim() ?? existing.name;
    const totalAmount = req.totalAmount ?? existing.total_amount;
    const status = req.status ?? existing.status;
    const dueDate = req.dueDate !== undefined ? req.dueDate : existing.due_date;

    if (totalAmount <= 0) {
      throw APIError.invalidArgument("Total amount must be positive");
    }

    const row = await db.queryRow<{
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
      UPDATE debts
      SET name = ${name}, total_amount = ${totalAmount}, status = ${status}, due_date = ${dueDate}
      WHERE id = ${req.id} AND user_id = ${auth.userID}
      RETURNING id, user_id, name, total_amount, paid_amount, status, date_taken, due_date, created_at
    `;

    if (!row) {
      throw APIError.internal("Failed to update debt");
    }

    const debt: Debt = {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      totalAmount: row.total_amount,
      paidAmount: row.paid_amount,
      status: row.status as "active" | "paid" | "cancelled",
      dateTaken: row.date_taken,
      dueDate: row.due_date,
      createdAt: row.created_at,
    };

    await logAudit(auth.userID, "debt", debt.id, "update", debt, {
      id: existing.id,
      userId: existing.user_id,
      name: existing.name,
      totalAmount: existing.total_amount,
      paidAmount: existing.paid_amount,
      status: existing.status as "active" | "paid" | "cancelled",
      dateTaken: existing.date_taken,
      dueDate: existing.due_date,
      createdAt: existing.created_at,
    });

    return debt;
  }
);
