import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionList } from "../components/TransactionList";
import { TransactionDialog } from "../components/TransactionDialog";
import { CategorySidebar } from "../components/CategorySidebar";
import { useToast } from "@/components/ui/use-toast";

export function Expenses() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: transactionsData } = useQuery({
    queryKey: ["transactions", "expense", currentMonth, currentYear],
    queryFn: () =>
      backend.transactions.list({
        type: "expense",
        month: currentMonth,
        year: currentYear,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.categories.list(),
  });

  const { data: summary } = useQuery({
    queryKey: ["summary", currentMonth, currentYear],
    queryFn: () => backend.transactions.summary({ month: currentMonth, year: currentYear }),
  });

  const expenseCategories = categoriesData?.categories.filter((c) => c.type === "expense") ?? [];

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.transactions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setDialogOpen(false);
      toast({ title: "Expense added successfully" });
    },
    onError: (error: any) => {
      console.error("Create expense error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Track your expenses for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CategorySidebar
            categories={expenseCategories}
            categoryTotals={summary?.expensesByCategory ?? []}
            totalExpenses={summary?.totalExpenses ?? 0}
          />
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Expense Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={transactionsData?.transactions ?? []}
                categories={expenseCategories}
                type="expense"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type="expense"
        categories={expenseCategories}
        onSubmit={(data) => createMutation.mutate(data)}
      />
    </div>
  );
}
