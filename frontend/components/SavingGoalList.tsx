import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import type { SavingGoal } from "~backend/savings/types";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { SavingContributionDialog } from "./SavingContributionDialog";
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

interface SavingGoalListProps {
  goals: SavingGoal[];
}

export function SavingGoalList({ goals }: SavingGoalListProps) {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [contributionGoal, setContributionGoal] = useState<SavingGoal | null>(null);
  const [actionType, setActionType] = useState<"add" | "withdraw">("add");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.savings.deleteSavingGoal({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
      toast({ title: "Saving goal deleted successfully" });
    },
    onError: (error: any) => {
      console.error("Delete goal error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (goals.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No saving goals found</p>;
  }

  return (
    <>
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = (goal.savedAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.savedAmount;

          return (
            <div
              key={goal.id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{goal.name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                    {goal.targetDate && (
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {goal.status === "active" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActionType("add");
                          setContributionGoal(goal);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActionType("withdraw");
                          setContributionGoal(goal);
                        }}
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Withdraw
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setGoalToDelete(goal.id);
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
                    ${goal.savedAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-500">
                    Remaining: ${remaining.toFixed(2)}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {goal.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {contributionGoal && (
        <SavingContributionDialog
          goal={contributionGoal}
          type={actionType}
          open={true}
          onOpenChange={(open) => !open && setContributionGoal(null)}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saving Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saving goal? This will also delete all
              related transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => goalToDelete && deleteMutation.mutate(goalToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
