import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { logAudit } from "../audit/log";

export interface DeleteTransactionRequest {
  id: number;
}

// Deletes a transaction and all related records.
export const deleteTx = api<DeleteTransactionRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/transactions/:id" },
  async (req) => {
    const auth = getAuthData()!;

    await using tx = await db.begin();

    const existing = await tx.queryRow<{
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
      FOR UPDATE
    `;

    if (!existing) {
      throw APIError.notFound("Transaction not found");
    }

    const debtPayment = await tx.queryRow<{ debt_id: number; amount: number }>`
      SELECT debt_id, amount FROM debt_payments WHERE transaction_id = ${req.id}
    `;

    if (debtPayment) {
      await tx.exec`
        UPDATE debts
        SET paid_amount = paid_amount - ${debtPayment.amount}
        WHERE id = ${debtPayment.debt_id}
      `;
    }

    const savingTx = await tx.queryRow<{ saving_id: number; amount: number }>`
      SELECT saving_id, amount FROM saving_transactions WHERE transaction_id = ${req.id}
    `;

    if (savingTx) {
      await tx.exec`
        UPDATE saving_goals
        SET saved_amount = saved_amount - ${savingTx.amount}
        WHERE id = ${savingTx.saving_id}
      `;
    }

    await tx.exec`
      DELETE FROM transactions
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    await tx.commit();

    await logAudit(auth.userID, "transaction", req.id, "delete", null, {
      id: existing.id,
      userId: existing.user_id,
      type: existing.type,
      categoryId: existing.category_id,
      amount: existing.amount,
      description: existing.description,
      date: existing.date,
      receiptFile: existing.receipt_file,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at,
    });
  }
);
