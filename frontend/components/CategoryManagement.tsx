import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import type { Category } from "~backend/categories/types";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
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

interface CategoryManagementProps {
  categories: Category[];
}

export function CategoryManagement({ categories }: CategoryManagementProps) {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: any) => backend.categories.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      toast({ title: "Category updated successfully" });
    },
    onError: (error: any) => {
      console.error("Update category error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.categories.deleteCat({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast({ title: "Category deleted successfully" });
    },
    onError: (error: any) => {
      console.error("Delete category error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4 text-sm">No categories yet</p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{category.name}</span>
              {category.isFixed && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted">Fixed</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingCategory(category)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCategoryToDelete(category.id);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingCategory && (
        <CategoryDialog
          open={true}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          type={editingCategory.type}
          category={editingCategory}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editingCategory.id, ...data })
          }
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoryToDelete && deleteMutation.mutate(categoryToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}