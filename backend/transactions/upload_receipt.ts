import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { receipts } from "../storage";

export interface UploadReceiptRequest {
  transactionId: number;
  fileName: string;
  fileData: string;
}

export interface UploadReceiptResponse {
  receiptUrl: string;
}

// Uploads a receipt file for a transaction.
export const uploadReceipt = api<UploadReceiptRequest, UploadReceiptResponse>(
  { auth: true, expose: true, method: "POST", path: "/transactions/:transactionId/receipt" },
  async (req) => {
    const auth = getAuthData()!;

    const transaction = await db.queryRow<{ id: number; user_id: string; receipt_file: string | null }>`
      SELECT id, user_id, receipt_file
      FROM transactions
      WHERE id = ${req.transactionId} AND user_id = ${auth.userID}
    `;

    if (!transaction) {
      throw APIError.notFound("Transaction not found");
    }

    const fileName = `${auth.userID}/${req.transactionId}/${Date.now()}-${req.fileName}`;

    const buffer = Buffer.from(req.fileData, 'base64');
    await receipts.upload(fileName, buffer, {
      contentType: "application/octet-stream",
    });

    await db.exec`
      UPDATE transactions
      SET receipt_file = ${fileName}, updated_at = NOW()
      WHERE id = ${req.transactionId}
    `;

    const url = await receipts.signedDownloadUrl(fileName, { ttl: 3600 });

    return { receiptUrl: url.url };
  }
);
