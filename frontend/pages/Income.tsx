import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionList } from "../components/TransactionList";
import { TransactionDialog } from "../components/TransactionDialog";
import { useToast } from "@/components/ui/use-toast";

export function Income() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: transactionsData } = useQuery({
    queryKey: ["transactions", "income", currentMonth, currentYear],
    queryFn: () =>
      backend.transactions.list({
        type: "income",
        month: currentMonth,
        year: currentYear,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.categories.list(),
  });

  const incomeCategories = categoriesData?.categories.filter((c) => c.type === "income") ?? [];

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.transactions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setDialogOpen(false);
      toast({ title: "Income added successfully" });
    },
    onError: (error: any) => {
      console.error("Create income error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Income</h2>
          <p className="text-muted-foreground">
            Track your income for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactionsData?.transactions ?? []}
            categories={incomeCategories}
            type="income"
          />
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type="income"
        categories={incomeCategories}
        onSubmit={(data) => createMutation.mutate(data)}
      />
    </div>
  );
}
