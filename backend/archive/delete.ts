import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { logAudit } from "../audit/log";

export interface DeleteArchiveRequest {
  id: number;
}

export interface DeleteArchiveResponse {
  success: boolean;
}

export interface RegenerateArchiveRequest {
  id: number;
}

// Deletes a monthly archive and its associated carryover transaction.
export const deleteArchive = api<DeleteArchiveRequest, DeleteArchiveResponse>(
  { auth: true, expose: true, method: "DELETE", path: "/archives/:id" },
  async (req) => {
    const auth = getAuthData()!;

    await using tx = await db.begin();

    const archive = await tx.queryRow<{
      id: number;
      user_id: string;
      month: number;
      year: number;
      carryover_out: number;
    }>`
      SELECT id, user_id, month, year, carryover_out
      FROM monthly_archives
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    if (!archive) {
      throw APIError.notFound("Archive not found");
    }

    // Delete the carryover transaction for the next month if it exists
    if (archive.carryover_out > 0) {
      const nextMonth = archive.month === 12 ? 1 : archive.month + 1;
      const nextYear = archive.month === 12 ? archive.year + 1 : archive.year;

      await tx.exec`
        DELETE FROM transactions
        WHERE user_id = ${auth.userID}
          AND type = 'carryover'
          AND EXTRACT(MONTH FROM date) = ${nextMonth}
          AND EXTRACT(YEAR FROM date) = ${nextYear}
          AND amount = ${archive.carryover_out}
          AND description = 'Carryover from previous month'
      `;
    }

    await tx.exec`
      DELETE FROM monthly_archives
      WHERE id = ${req.id} AND user_id = ${auth.userID}
    `;

    await tx.commit();

    await logAudit(auth.userID, "monthly_archive", req.id, "delete", {
      month: archive.month,
      year: archive.year,
    });

    return { success: true };
  }
);
