import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DebtList } from "../components/DebtList";
import { DebtDialog } from "../components/DebtDialog";
import { useToast } from "@/components/ui/use-toast";

export function Debts() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: debtsData } = useQuery({
    queryKey: ["debts"],
    queryFn: () => backend.debts.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.debts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      setDialogOpen(false);
      toast({ title: "Debt added successfully" });
    },
    onError: (error: any) => {
      console.error("Create debt error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const totalDebt = debtsData?.debts.reduce((sum, d) => sum + d.totalAmount, 0) ?? 0;
  const totalPaid = debtsData?.debts.reduce((sum, d) => sum + d.paidAmount, 0) ?? 0;
  const remaining = totalDebt - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Debts</h2>
          <p className="text-muted-foreground">Manage your debts and payments</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Debt
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDebt.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${remaining.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Debts</CardTitle>
        </CardHeader>
        <CardContent>
          <DebtList debts={debtsData?.debts ?? []} />
        </CardContent>
      </Card>

      <DebtDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
      />
    </div>
  );
}
