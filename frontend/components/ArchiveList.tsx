import type { MonthlyArchive } from "~backend/archive/types";
import { Button } from "@/components/ui/button";
import { Download, Trash2, RefreshCw } from "lucide-react";
import { useBackend } from "../hooks/useBackend";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ArchiveListProps {
  archives: MonthlyArchive[];
  onArchiveChanged: () => void;
}

export function ArchiveList({ archives, onArchiveChanged }: ArchiveListProps) {
  const backend = useBackend();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null);

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

  const handleDeleteArchive = async () => {
    if (!archiveToDelete) return;
    
    setIsDeleting(true);
    try {
      await backend.archive.deleteArchive({ id: archiveToDelete });
      toast({ title: "Archive deleted successfully" });
      onArchiveChanged();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setArchiveToDelete(null);
    }
  };

  const handleRegenerateArchive = async (archiveId: number) => {
    setIsRegenerating(archiveId);
    try {
      await backend.archive.regenerateArchive({ id: archiveId });
      toast({ title: "Archive regenerated successfully" });
      onArchiveChanged();
    } catch (error: any) {
      console.error("Regenerate error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsRegenerating(null);
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
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRegenerateArchive(archive.id)}
                  disabled={isRegenerating === archive.id}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating === archive.id ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadMonthReport(archive.month, archive.year)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setArchiveToDelete(archive.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Archive</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this monthly archive? This will also remove any carryover transaction created for the next month. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArchive} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
