import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, PiggyBank, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const backend = useBackend();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary", currentMonth, currentYear],
    queryFn: () => backend.transactions.summary({ month: currentMonth, year: currentYear }),
  });

  const { data: debtsData, isLoading: debtsLoading } = useQuery({
    queryKey: ["debts"],
    queryFn: () => backend.debts.list(),
  });

  const { data: savingsData, isLoading: savingsLoading } = useQuery({
    queryKey: ["savings"],
    queryFn: () => backend.savings.list(),
  });

  const totalDebt = debtsData?.debts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0) ?? 0;
  const totalSavings = savingsData?.goals.reduce((sum, g) => sum + g.savedAmount, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your finances for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-500">
                ${summary?.totalIncome.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-red-500">
                ${summary?.totalExpenses.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className={`text-2xl font-bold ${summary && summary.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${summary?.balance.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {summaryLoading || debtsLoading || savingsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-purple-500">
                ${(totalSavings - totalDebt).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : summary && summary.incomeByCategory.length > 0 ? (
              <div className="space-y-3">
                {summary.incomeByCategory.map((cat) => (
                  <div key={cat.categoryId ?? "uncategorized"} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cat.categoryName ?? "Uncategorized"}</span>
                      <span className="text-muted-foreground">${cat.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No income this month</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : summary && summary.expensesByCategory.length > 0 ? (
              <div className="space-y-3">
                {summary.expensesByCategory.map((cat) => (
                  <div key={cat.categoryId ?? "uncategorized"} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cat.categoryName ?? "Uncategorized"}</span>
                      <span className="text-muted-foreground">${cat.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No expenses this month</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Active Debts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debtsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : debtsData && debtsData.debts.filter((d) => d.status === "active").length > 0 ? (
              <div className="space-y-3">
                {debtsData.debts
                  .filter((d) => d.status === "active")
                  .map((debt) => {
                    const remaining = debt.totalAmount - debt.paidAmount;
                    const progress = (debt.paidAmount / debt.totalAmount) * 100;
                    return (
                      <div key={debt.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{debt.name}</span>
                          <span className="text-muted-foreground">${remaining.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active debts</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Saving Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savingsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : savingsData && savingsData.goals.filter((g) => g.status === "active").length > 0 ? (
              <div className="space-y-3">
                {savingsData.goals
                  .filter((g) => g.status === "active")
                  .map((goal) => {
                    const progress = (goal.savedAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{goal.name}</span>
                          <span className="text-muted-foreground">
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
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active goals</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
