import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useBackend } from "../hooks/useBackend";
import type { SavingGoal } from "~backend/savings/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface SavingContributionDialogProps {
  goal: SavingGoal;
  type: "add" | "withdraw";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SavingContributionDialog({
  goal,
  type,
  open,
  onOpenChange,
}: SavingContributionDialogProps) {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: any) =>
      backend.savings.addContribution({
        savingId: goal.id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onOpenChange(false);
      reset();
      toast({ title: "Contribution added successfully" });
    },
    onError: (error: any) => {
      console.error("Add contribution error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: any) =>
      backend.savings.withdraw({
        savingId: goal.id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onOpenChange(false);
      reset();
      toast({ title: "Withdrawal successful" });
    },
    onError: (error: any) => {
      console.error("Withdraw error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmitForm = (data: any) => {
    const payload = {
      amount: parseFloat(data.amount),
      date: new Date(data.date),
      description: data.description || undefined,
    };

    if (type === "add") {
      addMutation.mutate(payload);
    } else {
      withdrawMutation.mutate(payload);
    }
  };

  const maxAmount = type === "withdraw" ? goal.savedAmount : goal.targetAmount - goal.savedAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "add" ? "Add to" : "Withdraw from"} {goal.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount {type === "withdraw" && `(Max: $${maxAmount.toFixed(2)})`}
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={type === "withdraw" ? maxAmount : undefined}
              {...register("amount", { required: true, min: 0.01, max: type === "withdraw" ? maxAmount : undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" {...register("description")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{type === "add" ? "Add" : "Withdraw"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
