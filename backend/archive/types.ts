export interface MonthlyArchive {
  id: number;
  userId: string;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  debtsRemaining: number;
  carryoverIn: number;
  carryoverOut: number;
  createdAt: Date;
}
