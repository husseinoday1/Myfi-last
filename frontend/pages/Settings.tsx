import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryManagement } from "../components/CategoryManagement";
import { CategoryDialog } from "../components/CategoryDialog";
import { AuditLog } from "../components/AuditLog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Settings() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryType, setCategoryType] = useState<"income" | "expense">("income");

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.categories.list(),
  });

  const { data: auditData } = useQuery({
    queryKey: ["audit"],
    queryFn: () => backend.audit.list({ limit: 50 }),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => backend.categories.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryDialogOpen(false);
      toast({ title: "Category added successfully" });
    },
    onError: (error: any) => {
      console.error("Create category error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const incomeCategories = categoriesData?.categories.filter((c) => c.type === "income") ?? [];
  const expenseCategories = categoriesData?.categories.filter((c) => c.type === "expense") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage categories and view audit logs</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Income Categories</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setCategoryType("income");
                    setCategoryDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <CategoryManagement categories={incomeCategories} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expense Categories</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setCategoryType("expense");
                    setCategoryDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <CategoryManagement categories={expenseCategories} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLog logs={auditData?.logs ?? []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        type={categoryType}
        onSubmit={(data) => createCategoryMutation.mutate(data)}
      />
    </div>
  );
}
