import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clerkPublishableKey } from "./config";
import { AppInner } from "./AppInner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

export default function App() {
  if (!clerkPublishableKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Configuration Required</h1>
          <p className="text-muted-foreground">
            Please set your Clerk publishable key in frontend/config.ts
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppInner />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
