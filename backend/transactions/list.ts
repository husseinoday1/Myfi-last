import { api, Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Transaction } from "./types";

export interface ListTransactionsRequest {
  month?: Query<number>;
  year?: Query<number>;
  type?: Query<"income" | "expense" | "carryover">;
}

export interface ListTransactionsResponse {
  transactions: Transaction[];
}

// Retrieves all transactions for the authenticated user with optional filters.
export const list = api<ListTransactionsRequest, ListTransactionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/transactions" },
  async (req) => {
    const auth = getAuthData()!;

    let query = `
      SELECT id, user_id, type, category_id, amount, description, date, receipt_file, created_at, updated_at
      FROM transactions
      WHERE user_id = $1
    `;
    const params: any[] = [auth.userID];
    let paramIndex = 2;

    if (req.month !== undefined && req.year !== undefined) {
      query += ` AND EXTRACT(MONTH FROM date) = $${paramIndex} AND EXTRACT(YEAR FROM date) = $${paramIndex + 1}`;
      params.push(req.month, req.year);
      paramIndex += 2;
    }

    if (req.type) {
      query += ` AND type = $${paramIndex}`;
      params.push(req.type);
      paramIndex += 1;
    }

    query += ` ORDER BY date DESC, created_at DESC`;

    const rows = await db.rawQueryAll<{
      id: number;
      user_id: string;
      type: string;
      category_id: number | null;
      amount: number;
      description: string | null;
      date: Date;
      receipt_file: string | null;
      created_at: Date;
      updated_at: Date;
    }>(query, ...params);

    const transactions: Transaction[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type as "income" | "expense" | "carryover",
      categoryId: row.category_id,
      amount: row.amount,
      description: row.description,
      date: row.date,
      receiptFile: row.receipt_file,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { transactions };
  }
);
