import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Category, UpdateCategoryRequest } from "./types";
import { logAudit } from "../audit/log";

// Updates a category.
export const update = api<UpdateCategoryRequest, Category>(
  { auth: true, expose: true, method: "PUT", path: "/categories/:id" },
  async (req) => {
    const auth = getAuthData()!;

    const existing = await db.queryRow<{
      id: number;
      user_id: string;
      name: string;
      type: string;
      is_fixed: boolean;
      created_at: Date;
    }>`
      SELECT id, user_id, name, type, is_fixed, created_at
      FROM categories
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (!existing) {
      throw APIError.notFound("Category not found");
    }

    const name = req.name?.trim() ?? existing.name;
    const isFixed = req.isFixed ?? existing.is_fixed;

    const row = await db.queryRow<{
      id: number;
      user_id: string;
      name: string;
      type: string;
      is_fixed: boolean;
      created_at: Date;
    }>`
      UPDATE categories
      SET name = ${name}, is_fixed = ${isFixed}
      WHERE id = ${req.id} AND user_id = ${auth.userID}
      RETURNING id, user_id, name, type, is_fixed, created_at
    `;

    if (!row) {
      throw APIError.internal("Failed to update category");
    }

    const category: Category = {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type as "income" | "expense",
      isFixed: row.is_fixed,
      createdAt: row.created_at,
    };

    await logAudit(auth.userID, "category", category.id, "update", category, {
      id: existing.id,
      userId: existing.user_id,
      name: existing.name,
      type: existing.type as "income" | "expense",
      isFixed: existing.is_fixed,
      createdAt: existing.created_at,
    });

    return category;
  }
);
