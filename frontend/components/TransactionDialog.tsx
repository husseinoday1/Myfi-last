import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Transaction } from "~backend/transactions/types";
import type { Category } from "~backend/categories/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  categories: Category[];
  transaction?: Transaction;
  onSubmit: (data: any) => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  type,
  categories,
  transaction,
  onSubmit,
}: TransactionDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      categoryId: transaction?.categoryId ?? undefined,
      amount: transaction?.amount ?? 0,
      description: transaction?.description ?? "",
      date: transaction?.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  const selectedCategory = watch("categoryId");

  useEffect(() => {
    if (transaction) {
      setValue("categoryId", transaction.categoryId ?? undefined);
      setValue("amount", transaction.amount);
      setValue("description", transaction.description ?? "");
      setValue(
        "date",
        new Date(transaction.date).toISOString().split("T")[0]
      );
    } else {
      reset();
    }
  }, [transaction, reset, setValue]);

  const onSubmitForm = (data: any) => {
    onSubmit({
      type,
      categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
      amount: parseFloat(data.amount),
      description: data.description || undefined,
      date: new Date(data.date),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Edit" : "Add"} {type === "income" ? "Income" : "Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              value={selectedCategory?.toString()}
              onValueChange={(value) => setValue("categoryId", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register("amount", { required: true, min: 0.01 })}
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
            <Button type="submit">{transaction ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
