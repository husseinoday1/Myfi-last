import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useBackend } from "../hooks/useBackend";
import type { Debt } from "~backend/debts/types";
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

interface DebtPaymentDialogProps {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtPaymentDialog({ debt, open, onOpenChange }: DebtPaymentDialogProps) {
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

  const paymentMutation = useMutation({
    mutationFn: (data: any) =>
      backend.debts.addPayment({
        debtId: debt.id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onOpenChange(false);
      reset();
      toast({ title: "Payment added successfully" });
    },
    onError: (error: any) => {
      console.error("Add payment error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmitForm = (data: any) => {
    paymentMutation.mutate({
      amount: parseFloat(data.amount),
      date: new Date(data.date),
      description: data.description || undefined,
    });
  };

  const maxPayment = debt.totalAmount - debt.paidAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment to {debt.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (Max: ${maxPayment.toFixed(2)})
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={maxPayment}
              {...register("amount", { required: true, min: 0.01, max: maxPayment })}
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
            <Button type="submit">Add Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
