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

interface SavingGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function SavingGoalDialog({ open, onOpenChange, onSubmit }: SavingGoalDialogProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      targetAmount: 0,
      startDate: new Date().toISOString().split("T")[0],
      targetDate: "",
    },
  });

  const onSubmitForm = (data: any) => {
    onSubmit({
      name: data.name,
      targetAmount: parseFloat(data.targetAmount),
      startDate: new Date(data.startDate),
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Saving Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              {...register("targetAmount", { required: true, min: 0.01 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" {...register("startDate", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (optional)</Label>
            <Input id="targetDate" type="date" {...register("targetDate")} />
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
