import { useForm } from "react-hook-form";
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

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function DebtDialog({ open, onOpenChange, onSubmit }: DebtDialogProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      totalAmount: 0,
      dateTaken: new Date().toISOString().split("T")[0],
      dueDate: "",
    },
  });

  const onSubmitForm = (data: any) => {
    onSubmit({
      name: data.name,
      totalAmount: parseFloat(data.totalAmount),
      dateTaken: new Date(data.dateTaken),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Debt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0"
              {...register("totalAmount", { required: true, min: 0.01 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTaken">Date Taken</Label>
            <Input id="dateTaken" type="date" {...register("dateTaken", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (optional)</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
