import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import type { Transaction } from "~backend/transactions/types";
import type { Category } from "~backend/categories/types";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { TransactionDialog } from "./TransactionDialog";
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

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  type: "income" | "expense";
}

export function TransactionList({ transactions, categories, type }: TransactionListProps) {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: any) => backend.transactions.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setEditingTransaction(null);
      toast({ title: "Transaction updated successfully" });
    },
    onError: (error: any) => {
      console.error("Update transaction error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.transactions.deleteTx({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      toast({ title: "Transaction deleted successfully" });
    },
    onError: (error: any) => {
      console.error("Delete transaction error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (transactions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No transactions found for this month
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((transaction) => {
          const category = categories.find((c) => c.id === transaction.categoryId);
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category?.name ?? "Uncategorized"}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
                {transaction.description && (
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-lg font-semibold ${
                    type === "income" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ${transaction.amount.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setTransactionToDelete(transaction.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingTransaction && (
        <TransactionDialog
          open={true}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          type={type}
          categories={categories}
          transaction={editingTransaction}
          onSubmit={(data) => updateMutation.mutate({ id: editingTransaction.id, ...data })}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => transactionToDelete && deleteMutation.mutate(transactionToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
