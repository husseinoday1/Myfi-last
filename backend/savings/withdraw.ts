import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { WithdrawSavingRequest } from "./types";
import { logAudit } from "../audit/log";

export interface WithdrawResponse {
  transactionId: number;
  savingTransactionId: number;
  updatedSavedAmount: number;
}

// Withdraws money from a saving goal, creating a transaction and updating the saved amount atomically.
export const withdraw = api<WithdrawSavingRequest, WithdrawResponse>(
  { auth: true, expose: true, method: "POST", path: "/savings/:savingId/withdraw" },
  async (req) => {
    const auth = getAuthData()!;

    if (req.amount <= 0) {
      throw APIError.invalidArgument("Withdrawal amount must be positive");
    }

    await using tx = await db.begin();

    const goal = await tx.queryRow<{
      id: number;
      user_id: string;
      saved_amount: number;
    }>`
      SELECT id, user_id, saved_amount
      FROM saving_goals
      WHERE id = ${req.savingId}
      FOR UPDATE
    `;

    if (!goal || goal.user_id !== auth.userID) {
      throw APIError.notFound("Saving goal not found");
    }

    if (req.amount > goal.saved_amount) {
      throw APIError.invalidArgument("Withdrawal amount exceeds saved amount");
    }

    const newSavedAmount = goal.saved_amount - req.amount;

    const transactionRow = await tx.queryRow<{ id: number }>`
      INSERT INTO transactions (user_id, type, amount, description, date)
      VALUES (${auth.userID}, 'income', ${req.amount}, ${req.description ?? `Withdrawal from savings`}, ${req.date})
      RETURNING id
    `;

    if (!transactionRow) {
      throw APIError.internal("Failed to create transaction");
    }

    const savingTxRow = await tx.queryRow<{ id: number }>`
      INSERT INTO saving_transactions (saving_id, transaction_id, amount, date, description)
      VALUES (${req.savingId}, ${transactionRow.id}, ${req.amount}, ${req.date}, ${req.description ?? null})
      RETURNING id
    `;

    if (!savingTxRow) {
      throw APIError.internal("Failed to create saving transaction");
    }

    await tx.exec`
      UPDATE saving_goals
      SET saved_amount = ${newSavedAmount}
      WHERE id = ${req.savingId}
    `;

    await tx.commit();

    await logAudit(auth.userID, "saving_transaction", savingTxRow.id, "create", {
      id: savingTxRow.id,
      savingId: req.savingId,
      transactionId: transactionRow.id,
      amount: -req.amount,
      date: req.date,
      description: req.description,
    });

    return {
      transactionId: transactionRow.id,
      savingTransactionId: savingTxRow.id,
      updatedSavedAmount: newSavedAmount,
    };
  }
);
