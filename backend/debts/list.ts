import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Debt } from "./types";

export interface ListDebtsResponse {
  debts: Debt[];
}

// Retrieves all debts for the authenticated user.
export const list = api<void, ListDebtsResponse>(
  { auth: true, expose: true, method: "GET", path: "/debts" },
  async () => {
    const auth = getAuthData()!;

    const rows = await db.queryAll<{
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
      WHERE user_id = ${auth.userID}
      ORDER BY date_taken DESC
    `;

    const debts: Debt[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      totalAmount: row.total_amount,
      paidAmount: row.paid_amount,
      status: row.status as "active" | "paid" | "cancelled",
      dateTaken: row.date_taken,
      dueDate: row.due_date,
      createdAt: row.created_at,
    }));

    return { debts };
  }
);
