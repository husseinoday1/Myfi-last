import type { Category } from "~backend/categories/types";
import type { CategoryTotal } from "~backend/transactions/summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategorySidebarProps {
  categories: Category[];
  categoryTotals: CategoryTotal[];
  totalExpenses: number;
}

export function CategorySidebar({
  categories,
  categoryTotals,
  totalExpenses,
}: CategorySidebarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((category) => {
            const total = categoryTotals.find((ct) => ct.categoryId === category.id);
            const amount = total?.total ?? 0;
            const percentage = total?.percentage ?? 0;

            return (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-muted-foreground">${amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-muted-foreground text-center py-4 text-sm">
              No categories yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
