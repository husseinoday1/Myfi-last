import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { DebtPayment } from "./types";

export interface ListPaymentsRequest {
  debtId: number;
}

export interface ListPaymentsResponse {
  payments: DebtPayment[];
}

// Retrieves all payments for a specific debt.
export const listPayments = api<ListPaymentsRequest, ListPaymentsResponse>(
  { auth: true, expose: true, method: "GET", path: "/debts/:debtId/payments" },
  async (req) => {
    const auth = getAuthData()!;

    const debt = await db.queryRow<{ user_id: string }>`
      SELECT user_id FROM debts WHERE id = ${req.debtId}
    `;

    if (!debt || debt.user_id !== auth.userID) {
      return { payments: [] };
    }

    const rows = await db.queryAll<{
      id: number;
      debt_id: number;
      transaction_id: number;
      amount: number;
      date: Date;
      description: string | null;
      created_at: Date;
    }>`
      SELECT id, debt_id, transaction_id, amount, date, description, created_at
      FROM debt_payments
      WHERE debt_id = ${req.debtId}
      ORDER BY date DESC
    `;

    const payments: DebtPayment[] = rows.map((row) => ({
      id: row.id,
      debtId: row.debt_id,
      transactionId: row.transaction_id,
      amount: row.amount,
      date: row.date,
      description: row.description,
      createdAt: row.created_at,
    }));

    return { payments };
  }
);
