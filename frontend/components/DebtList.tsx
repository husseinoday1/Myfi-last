import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import type { Debt } from "~backend/debts/types";
import { Button } from "@/components/ui/button";
import { Trash2, DollarSign } from "lucide-react";
import { DebtPaymentDialog } from "./DebtPaymentDialog";
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

interface DebtListProps {
  debts: Debt[];
}

export function DebtList({ debts }: DebtListProps) {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.debts.deleteDebt({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      setDeleteDialogOpen(false);
      setDebtToDelete(null);
      toast({ title: "Debt deleted successfully" });
    },
    onError: (error: any) => {
      console.error("Delete debt error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (debts.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No debts found</p>;
  }

  return (
    <>
      <div className="space-y-4">
        {debts.map((debt) => {
          const remaining = debt.totalAmount - debt.paidAmount;
          const progress = (debt.paidAmount / debt.totalAmount) * 100;

          return (
            <div
              key={debt.id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{debt.name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Taken: {new Date(debt.dateTaken).toLocaleDateString()}</span>
                    {debt.dueDate && (
                      <span>Due: {new Date(debt.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {debt.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPaymentDebt(debt)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Payment
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDebtToDelete(debt.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    ${debt.paidAmount.toFixed(2)} / ${debt.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      debt.status === "paid" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    Remaining: ${remaining.toFixed(2)}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {debt.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {paymentDebt && (
        <DebtPaymentDialog
          debt={paymentDebt}
          open={true}
          onOpenChange={(open) => !open && setPaymentDebt(null)}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Debt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this debt? This will also delete all related
              payments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => debtToDelete && deleteMutation.mutate(debtToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
