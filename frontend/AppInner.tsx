import { SignIn, SignUp, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Income } from "./pages/Income";
import { Expenses } from "./pages/Expenses";
import { Debts } from "./pages/Debts";
import { Savings } from "./pages/Savings";
import { Archive } from "./pages/Archive";
import { Settings } from "./pages/Settings";
import { Layout } from "./components/Layout";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function AppInner() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={theme}>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="w-full max-w-md space-y-8">
            <div className="flex justify-center">
              <SignIn routing="hash" signUpUrl="#/sign-up" />
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <div className="border-b border-border">
              <div className="flex items-center justify-between px-6 py-4">
                <h1 className="text-2xl font-bold">Personal Finance Manager</h1>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                  <UserButton />
                </div>
              </div>
            </div>

            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/income" element={<Income />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/debts" element={<Debts />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/sign-up" element={<SignUp routing="hash" signInUrl="#/" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </div>
        </BrowserRouter>
      </SignedIn>
    </div>
  );
}
