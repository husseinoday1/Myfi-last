export interface AuditLog {
  id: number;
  userId: string;
  entityType: string;
  entityId: number;
  action: "create" | "update" | "delete";
  payloadBefore: any;
  payloadAfter: any;
  timestamp: Date;
}

export type AuditLogEntry = AuditLog;
