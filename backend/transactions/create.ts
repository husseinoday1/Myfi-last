import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Transaction, CreateTransactionRequest } from "./types";
import { logAudit } from "../audit/log";

// Creates a new transaction.
export const create = api<CreateTransactionRequest, Transaction>(
  { auth: true, expose: true, method: "POST", path: "/transactions" },
  async (req) => {
    const auth = getAuthData()!;

    if (req.amount <= 0) {
      throw APIError.invalidArgument("Amount must be positive");
    }

    if (req.type !== "income" && req.type !== "expense" && req.type !== "carryover") {
      throw APIError.invalidArgument("Invalid transaction type");
    }

    if (req.categoryId && req.type !== "carryover") {
      const category = await db.queryRow<{ id: number; user_id: string }>`
        SELECT id, user_id FROM categories WHERE id = ${req.categoryId}
      `;

      if (!category || category.user_id !== auth.userID) {
        throw APIError.invalidArgument("Invalid category");
      }
    }

    const row = await db.queryRow<{
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
    }>`
      INSERT INTO transactions (user_id, type, category_id, amount, description, date)
      VALUES (${auth.userID}, ${req.type}, ${req.categoryId ?? null}, ${req.amount}, ${req.description ?? null}, ${req.date})
      RETURNING id, user_id, type, category_id, amount, description, date, receipt_file, created_at, updated_at
    `;

    if (!row) {
      throw APIError.internal("Failed to create transaction");
    }

    const transaction: Transaction = {
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
    };

    await logAudit(auth.userID, "transaction", transaction.id, "create", transaction);

    return transaction;
  }
);
