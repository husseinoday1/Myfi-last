import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { AddSavingRequest } from "./types";
import { logAudit } from "../audit/log";

export interface AddContributionResponse {
  transactionId: number;
  savingTransactionId: number;
  updatedSavedAmount: number;
}

// Adds a contribution to a saving goal, creating a transaction and updating the saved amount atomically.
export const addContribution = api<AddSavingRequest, AddContributionResponse>(
  { auth: true, expose: true, method: "POST", path: "/savings/:savingId/contributions" },
  async (req) => {
    const auth = getAuthData()!;

    if (req.amount <= 0) {
      throw APIError.invalidArgument("Contribution amount must be positive");
    }

    await using tx = await db.begin();

    const goal = await tx.queryRow<{
      id: number;
      user_id: string;
      target_amount: number;
      saved_amount: number;
      status: string;
    }>`
      SELECT id, user_id, target_amount, saved_amount, status
      FROM saving_goals
      WHERE id = ${req.savingId}
      FOR UPDATE
    `;

    if (!goal || goal.user_id !== auth.userID) {
      throw APIError.notFound("Saving goal not found");
    }

    if (goal.status !== "active") {
      throw APIError.invalidArgument("Cannot add contribution to inactive goal");
    }

    const newSavedAmount = goal.saved_amount + req.amount;

    const transactionRow = await tx.queryRow<{ id: number }>`
      INSERT INTO transactions (user_id, type, amount, description, date)
      VALUES (${auth.userID}, 'expense', ${req.amount}, ${req.description ?? `Contribution to savings`}, ${req.date})
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

    const newStatus = newSavedAmount >= goal.target_amount ? "completed" : "active";

    await tx.exec`
      UPDATE saving_goals
      SET saved_amount = ${newSavedAmount}, status = ${newStatus}
      WHERE id = ${req.savingId}
    `;

    await tx.commit();

    await logAudit(auth.userID, "saving_transaction", savingTxRow.id, "create", {
      id: savingTxRow.id,
      savingId: req.savingId,
      transactionId: transactionRow.id,
      amount: req.amount,
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
