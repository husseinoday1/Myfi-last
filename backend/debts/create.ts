import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Debt, CreateDebtRequest } from "./types";
import { logAudit } from "../audit/log";

// Creates a new debt.
export const create = api<CreateDebtRequest, Debt>(
  { auth: true, expose: true, method: "POST", path: "/debts" },
  async (req) => {
    const auth = getAuthData()!;

    if (!req.name.trim()) {
      throw APIError.invalidArgument("Debt name is required");
    }

    if (req.totalAmount <= 0) {
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
      INSERT INTO debts (user_id, name, total_amount, date_taken, due_date)
      VALUES (${auth.userID}, ${req.name.trim()}, ${req.totalAmount}, ${req.dateTaken}, ${req.dueDate ?? null})
      RETURNING id, user_id, name, total_amount, paid_amount, status, date_taken, due_date, created_at
    `;

    if (!row) {
      throw APIError.internal("Failed to create debt");
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

    await logAudit(auth.userID, "debt", debt.id, "create", debt);

    return debt;
  }
);
