import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";
import { ArchiveList } from "../components/ArchiveList";
import { CloseMonthDialog } from "../components/CloseMonthDialog";
import { useToast } from "@/components/ui/use-toast";

export function Archive() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [closeMonthOpen, setCloseMonthOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data: archivesData } = useQuery({
    queryKey: ["archives"],
    queryFn: () => backend.archive.list(),
  });

  const closeMonthMutation = useMutation({
    mutationFn: (data: { month: number; year: number }) =>
      backend.archive.closeMonth(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archives"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setCloseMonthOpen(false);
      toast({ title: "Month closed successfully" });
    },
    onError: (error: any) => {
      console.error("Close month error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const downloadYearlyReport = async () => {
    try {
      const data = await backend.archive.exportData({
        month: 1,
        year: currentYear,
        type: "yearly",
      });
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-report-${currentYear}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Report downloaded successfully" });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Archive</h2>
          <p className="text-muted-foreground">View and export historical data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadYearlyReport}>
            <Download className="h-4 w-4 mr-2" />
            Download {currentYear} Report
          </Button>
          <Button onClick={() => setCloseMonthOpen(true)}>
            <Lock className="h-4 w-4 mr-2" />
            Close Month
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Archives</CardTitle>
        </CardHeader>
        <CardContent>
          <ArchiveList archives={archivesData?.archives ?? []} />
        </CardContent>
      </Card>

      <CloseMonthDialog
        open={closeMonthOpen}
        onOpenChange={setCloseMonthOpen}
        onSubmit={(data) => closeMonthMutation.mutate(data)}
      />
    </div>
  );
}
