import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Transaction, UpdateTransactionRequest } from "./types";
import { logAudit } from "../audit/log";

// Updates a transaction.
export const update = api<UpdateTransactionRequest, Transaction>(
  { auth: true, expose: true, method: "PUT", path: "/transactions/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const existing = await db.queryRow<{
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
      SELECT id, user_id, type, category_id, amount, description, date, receipt_file, created_at, updated_at
      FROM transactions
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (!existing) {
      throw APIError.notFound("Transaction not found");
    }

    const amount = req.amount ?? existing.amount;
    if (amount <= 0) {
      throw APIError.invalidArgument("Amount must be positive");
    }

    const categoryId = req.categoryId !== undefined ? req.categoryId : existing.category_id;
    if (categoryId && existing.type !== "carryover") {
      const category = await db.queryRow<{ id: number; user_id: string }>`
        SELECT id, user_id FROM categories WHERE id = ${categoryId}
      `;

      if (!category || category.user_id !== auth.userID) {
        throw APIError.invalidArgument("Invalid category");
      }
    }

    const description = req.description !== undefined ? req.description : existing.description;
    const date = req.date ?? existing.date;

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
      UPDATE transactions
      SET category_id = ${categoryId}, amount = ${amount}, description = ${description}, date = ${date}, updated_at = NOW()
      WHERE id = ${req.id} AND user_id = ${auth.userID}
      RETURNING id, user_id, type, category_id, amount, description, date, receipt_file, created_at, updated_at
    `;

    if (!row) {
      throw APIError.internal("Failed to update transaction");
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

    await logAudit(auth.userID, "transaction", transaction.id, "update", transaction, {
      id: existing.id,
      userId: existing.user_id,
      type: existing.type as "income" | "expense" | "carryover",
      categoryId: existing.category_id,
      amount: existing.amount,
      description: existing.description,
      date: existing.date,
      receiptFile: existing.receipt_file,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at,
    });

    return transaction;
  }
);
