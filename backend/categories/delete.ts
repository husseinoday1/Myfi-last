import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { logAudit } from "../audit/log";

export interface DeleteCategoryRequest {
  id: number;
}

// Deletes a category.
export const deleteCat = api<DeleteCategoryRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/categories/:id" },
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

    await db.exec`
      DELETE FROM categories
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    await logAudit(
      auth.userID,
      "category",
      req.id,
      "delete",
      null,
      {
        id: existing.id,
        userId: existing.user_id,
        name: existing.name,
        type: existing.type,
        isFixed: existing.is_fixed,
        createdAt: existing.created_at,
      }
    );
  }
);
