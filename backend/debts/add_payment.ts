import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { AddPaymentRequest } from "./types";
import { logAudit } from "../audit/log";

export interface AddPaymentResponse {
  paymentId: number;
  transactionId: number;
  updatedPaidAmount: number;
}

// Adds a payment to a debt, creating a transaction and updating the debt balance atomically.
export const addPayment = api<AddPaymentRequest, AddPaymentResponse>(
  { auth: true, expose: true, method: "POST", path: "/debts/:debtId/payments" },
  async (req) => {
    const auth = getAuthData()!;

    if (req.amount <= 0) {
      throw APIError.invalidArgument("Payment amount must be positive");
    }

    await using tx = await db.begin();

    const debt = await tx.queryRow<{
      id: number;
      user_id: string;
      total_amount: number;
      paid_amount: number;
      status: string;
    }>`
      SELECT id, user_id, total_amount, paid_amount, status
      FROM debts
      WHERE id = ${req.debtId}
      FOR UPDATE
    `;

    if (!debt || debt.user_id !== auth.userID) {
      throw APIError.notFound("Debt not found");
    }

    if (debt.status !== "active") {
      throw APIError.invalidArgument("Cannot add payment to inactive debt");
    }

    const newPaidAmount = debt.paid_amount + req.amount;
    if (newPaidAmount > debt.total_amount) {
      throw APIError.invalidArgument("Payment would exceed total debt amount");
    }

    const transactionRow = await tx.queryRow<{ id: number }>`
      INSERT INTO transactions (user_id, type, amount, description, date)
      VALUES (${auth.userID}, 'expense', ${req.amount}, ${req.description ?? `Payment for debt`}, ${req.date})
      RETURNING id
    `;

    if (!transactionRow) {
      throw APIError.internal("Failed to create transaction");
    }

    const paymentRow = await tx.queryRow<{ id: number }>`
      INSERT INTO debt_payments (debt_id, transaction_id, amount, date, description)
      VALUES (${req.debtId}, ${transactionRow.id}, ${req.amount}, ${req.date}, ${req.description ?? null})
      RETURNING id
    `;

    if (!paymentRow) {
      throw APIError.internal("Failed to create payment");
    }

    const newStatus = newPaidAmount >= debt.total_amount ? "paid" : "active";

    await tx.exec`
      UPDATE debts
      SET paid_amount = ${newPaidAmount}, status = ${newStatus}
      WHERE id = ${req.debtId}
    `;

    await tx.commit();

    await logAudit(auth.userID, "debt_payment", paymentRow.id, "create", {
      id: paymentRow.id,
      debtId: req.debtId,
      transactionId: transactionRow.id,
      amount: req.amount,
      date: req.date,
      description: req.description,
    });

    return {
      paymentId: paymentRow.id,
      transactionId: transactionRow.id,
      updatedPaidAmount: newPaidAmount,
    };
  }
);
