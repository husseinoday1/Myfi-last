import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Category } from "./types";

export interface ListCategoriesResponse {
  categories: Category[];
}

// Retrieves all categories for the authenticated user.
export const list = api<void, ListCategoriesResponse>(
  { auth: true, expose: true, method: "GET", path: "/categories" },
  async () => {
    const auth = getAuthData()!;

    const rows = await db.queryAll<{
      id: number;
      user_id: string;
      name: string;
      type: string;
      is_fixed: boolean;
      created_at: Date;
    }>`
      SELECT id, user_id, name, type, is_fixed, created_at
      FROM categories
      WHERE user_id = ${auth.userID}
      ORDER BY type, name
    `;

    const categories: Category[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type as "income" | "expense",
      isFixed: row.is_fixed,
      createdAt: row.created_at,
    }));

    return { categories };
  }
);
