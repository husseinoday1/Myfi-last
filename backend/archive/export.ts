import { api, Query, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface ExportRequest {
  month: Query<number>;
  year: Query<number>;
  type: Query<"monthly" | "yearly">;
}

export interface ExportResponse {
  csv: string;
}

// Exports transactions and summaries as CSV.
export const exportData = api<ExportRequest, ExportResponse>(
  { auth: true, expose: true, method: "GET", path: "/archives/export" },
  async (req) => {
    const auth = getAuthData()!;

    if (req.type === "monthly") {
      const transactions = await db.rawQueryAll<{
        date: Date;
        type: string;
        category: string | null;
        description: string | null;
        amount: number;
      }>(
        `
        SELECT t.date, t.type, c.name as category, t.description, t.amount
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1
          AND EXTRACT(MONTH FROM t.date) = $2
          AND EXTRACT(YEAR FROM t.date) = $3
        ORDER BY t.date, t.created_at
      `,
        auth.userID,
        req.month,
        req.year
      );

      let csv = "Date,Type,Category,Description,Amount\n";
      for (const tx of transactions) {
        const date = new Date(tx.date).toISOString().split("T")[0];
        const type = tx.type;
        const category = tx.category ?? "N/A";
        const description = (tx.description ?? "").replace(/"/g, '""');
        const amount = tx.amount.toFixed(2);
        csv += `${date},${type},"${category}","${description}",${amount}\n`;
      }

      return { csv };
    } else {
      const transactions = await db.rawQueryAll<{
        date: Date;
        type: string;
        category: string | null;
        description: string | null;
        amount: number;
      }>(
        `
        SELECT t.date, t.type, c.name as category, t.description, t.amount
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1
          AND EXTRACT(YEAR FROM t.date) = $2
        ORDER BY t.date, t.created_at
      `,
        auth.userID,
        req.year
      );

      let csv = "Date,Type,Category,Description,Amount\n";
      for (const tx of transactions) {
        const date = tx.date.toISOString().split("T")[0];
        const type = tx.type;
        const category = tx.category ?? "N/A";
        const description = (tx.description ?? "").replace(/"/g, '""');
        const amount = tx.amount.toFixed(2);
        csv += `${date},${type},"${category}","${description}",${amount}\n`;
      }

      return { csv };
    }
  }
);
