import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  category?: Category;
  onSubmit: (data: any) => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  type,
  category,
  onSubmit,
}: CategoryDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: category?.name ?? "",
      isFixed: category?.isFixed ?? false,
    },
  });

  const isFixed = watch("isFixed");

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("isFixed", category.isFixed);
    } else {
      reset();
    }
  }, [category, reset, setValue]);

  const onSubmitForm = (data: any) => {
    onSubmit({
      name: data.name,
      type,
      isFixed: data.isFixed,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit" : "Add"} {type === "income" ? "Income" : "Expense"} Category
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Category name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFixed"
              checked={isFixed}
              onCheckedChange={(checked) => setValue("isFixed", checked as boolean)}
            />
            <Label htmlFor="isFixed" className="cursor-pointer">
              Fixed {type === "income" ? "income" : "expense"}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{category ? "Update" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
