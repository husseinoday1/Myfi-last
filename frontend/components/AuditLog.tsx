import type { AuditLogEntry } from "~backend/audit/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditLogProps {
  logs: AuditLogEntry[];
}

export function AuditLog({ logs }: AuditLogProps) {
  if (logs.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No audit logs yet</p>;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm">{formatDate(log.timestamp)}</TableCell>
              <TableCell className="text-sm font-medium">{log.entityType}</TableCell>
              <TableCell className="text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    log.action === "create"
                      ? "bg-green-500/10 text-green-500"
                      : log.action === "update"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {log.action}
                </span>
              </TableCell>
              <TableCell className="text-sm">{log.entityId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
