import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SavingGoalList } from "../components/SavingGoalList";
import { SavingGoalDialog } from "../components/SavingGoalDialog";
import { useToast } from "@/components/ui/use-toast";

export function Savings() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: savingsData } = useQuery({
    queryKey: ["savings"],
    queryFn: () => backend.savings.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.savings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      setDialogOpen(false);
      toast({ title: "Saving goal added successfully" });
    },
    onError: (error: any) => {
      console.error("Create saving goal error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const totalTarget = savingsData?.goals.reduce((sum, g) => sum + g.targetAmount, 0) ?? 0;
  const totalSaved = savingsData?.goals.reduce((sum, g) => sum + g.savedAmount, 0) ?? 0;
  const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Savings</h2>
          <p className="text-muted-foreground">Track your saving goals</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTarget.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalSaved.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingGoalList goals={savingsData?.goals ?? []} />
        </CardContent>
      </Card>

      <SavingGoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
      />
    </div>
  );
}
