import db from "../db";

export async function logAudit(
  userId: string,
  entityType: string,
  entityId: number,
  action: "create" | "update" | "delete",
  payloadAfter: any,
  payloadBefore: any = null
): Promise<void> {
  await db.exec`
    INSERT INTO audit_logs (user_id, entity_type, entity_id, action, payload_before, payload_after)
    VALUES (${userId}, ${entityType}, ${entityId}, ${action}, ${JSON.stringify(payloadBefore)}, ${JSON.stringify(payloadAfter)})
  `;
}
