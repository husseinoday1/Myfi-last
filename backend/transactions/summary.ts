import { api, Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface TransactionSummaryRequest {
  month: Query<number>;
  year: Query<number>;
}

export interface CategoryTotal {
  categoryId: number | null;
  categoryName: string | null;
  total: number;
  percentage: number;
}

export interface TransactionSummaryResponse {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeByCategory: CategoryTotal[];
  expensesByCategory: CategoryTotal[];
}

// Retrieves summary statistics for transactions in a specific month.
export const summary = api<TransactionSummaryRequest, TransactionSummaryResponse>(
  { auth: true, expose: true, method: "GET", path: "/transactions/summary" },
  async (req) => {
    const auth = getAuthData()!;

    const totals = await db.queryRow<{
      total_income: number | null;
      total_expenses: number | null;
    }>`
      SELECT
        SUM(CASE WHEN type = 'income' OR type = 'carryover' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
      FROM transactions
      WHERE user_id = ${auth.userID}
        AND EXTRACT(MONTH FROM date) = ${req.month}
        AND EXTRACT(YEAR FROM date) = ${req.year}
    `;

    const totalIncome = totals?.total_income ?? 0;
    const totalExpenses = totals?.total_expenses ?? 0;

    const incomeRows = await db.queryAll<{
      category_id: number | null;
      category_name: string | null;
      total: number;
    }>`
      SELECT
        t.category_id,
        c.name as category_name,
        SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ${auth.userID}
        AND (t.type = 'income' OR t.type = 'carryover')
        AND EXTRACT(MONTH FROM t.date) = ${req.month}
        AND EXTRACT(YEAR FROM t.date) = ${req.year}
      GROUP BY t.category_id, c.name
      ORDER BY total DESC
    `;

    const expenseRows = await db.queryAll<{
      category_id: number | null;
      category_name: string | null;
      total: number;
    }>`
      SELECT
        t.category_id,
        c.name as category_name,
        SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ${auth.userID}
        AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.date) = ${req.month}
        AND EXTRACT(YEAR FROM t.date) = ${req.year}
      GROUP BY t.category_id, c.name
      ORDER BY total DESC
    `;

    const incomeByCategory: CategoryTotal[] = incomeRows.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      total: row.total,
      percentage: totalIncome > 0 ? (row.total / totalIncome) * 100 : 0,
    }));

    const expensesByCategory: CategoryTotal[] = expenseRows.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      total: row.total,
      percentage: totalExpenses > 0 ? (row.total / totalExpenses) * 100 : 0,
    }));

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeByCategory,
      expensesByCategory,
    };
  }
);
