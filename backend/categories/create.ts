import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Category, CreateCategoryRequest } from "./types";
import { logAudit } from "../audit/log";

// Creates a new category.
export const create = api<CreateCategoryRequest, Category>(
  { auth: true, expose: true, method: "POST", path: "/categories" },
  async (req) => {
    const auth = getAuthData()!;

    if (!req.name.trim()) {
      throw APIError.invalidArgument("Category name is required");
    }

    if (req.type !== "income" && req.type !== "expense") {
      throw APIError.invalidArgument("Type must be income or expense");
    }

    try {
      const row = await db.queryRow<{
        id: number;
        user_id: string;
        name: string;
        type: string;
        is_fixed: boolean;
        created_at: Date;
      }>`
        INSERT INTO categories (user_id, name, type, is_fixed)
        VALUES (${auth.userID}, ${req.name.trim()}, ${req.type}, ${req.isFixed})
        RETURNING id, user_id, name, type, is_fixed, created_at
      `;

      if (!row) {
        throw APIError.internal("Failed to create category");
      }

      const category: Category = {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        type: row.type as "income" | "expense",
        isFixed: row.is_fixed,
        createdAt: row.created_at,
      };

      await logAudit(auth.userID, "category", category.id, "create", category);

      return category;
    } catch (err: any) {
      if (err.message?.includes("unique")) {
        throw APIError.alreadyExists("Category with this name already exists");
      }
      throw err;
    }
  }
);
