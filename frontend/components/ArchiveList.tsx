import type { MonthlyArchive } from "~backend/archive/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useBackend } from "../hooks/useBackend";
import { useToast } from "@/components/ui/use-toast";

interface ArchiveListProps {
  archives: MonthlyArchive[];
}

export function ArchiveList({ archives }: ArchiveListProps) {
  const backend = useBackend();
  const { toast } = useToast();

  const downloadMonthReport = async (month: number, year: number) => {
    try {
      const data = await backend.archive.exportData({
        month,
        year,
        type: "monthly",
      });
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-report-${year}-${month.toString().padStart(2, "0")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Report downloaded successfully" });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (archives.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No archived months found</p>;
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-4">
      {archives.map((archive) => {
        const balance = archive.totalIncome - archive.totalExpenses;
        return (
          <div
            key={archive.id}
            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {monthNames[archive.month - 1]} {archive.year}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Closed on {new Date(archive.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadMonthReport(archive.month, archive.year)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Income:</span>
                <p className="font-semibold text-green-500">${archive.totalIncome.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Expenses:</span>
                <p className="font-semibold text-red-500">${archive.totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Balance:</span>
                <p className={`font-semibold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  ${balance.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Carryover:</span>
                <p className="font-semibold">${archive.carryoverOut.toFixed(2)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
