import { api, Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { AuditLog } from "./types";

export interface ListAuditLogsRequest {
  limit?: Query<number>;
}

export interface ListAuditLogsResponse {
  logs: AuditLog[];
}

// Retrieves audit logs for the authenticated user.
export const list = api<ListAuditLogsRequest, ListAuditLogsResponse>(
  { auth: true, expose: true, method: "GET", path: "/audit" },
  async (req) => {
    const auth = getAuthData()!;
    const limit = req.limit ?? 100;

    const rows = await db.queryAll<{
      id: number;
      user_id: string;
      entity_type: string;
      entity_id: number;
      action: string;
      payload_before: any;
      payload_after: any;
      timestamp: Date;
    }>`
      SELECT id, user_id, entity_type, entity_id, action, payload_before, payload_after, timestamp
      FROM audit_logs
      WHERE user_id = ${auth.userID}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;

    const logs: AuditLog[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action as "create" | "update" | "delete",
      payloadBefore: row.payload_before,
      payloadAfter: row.payload_after,
      timestamp: row.timestamp,
    }));

    return { logs };
  }
);
