export interface SavingGoal {
  id: number;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  startDate: Date;
  targetDate: Date | null;
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
}

export interface SavingTransaction {
  id: number;
  savingId: number;
  transactionId: number;
  amount: number;
  date: Date;
  description: string | null;
  createdAt: Date;
}

export interface CreateSavingGoalRequest {
  name: string;
  targetAmount: number;
  startDate: Date;
  targetDate?: Date;
}

export interface UpdateSavingGoalRequest {
  id: number;
  name?: string;
  targetAmount?: number;
  status?: "active" | "completed" | "cancelled";
  targetDate?: Date;
}

export interface AddSavingRequest {
  savingId: number;
  amount: number;
  date: Date;
  description?: string;
}

export interface WithdrawSavingRequest {
  savingId: number;
  amount: number;
  date: Date;
  description?: string;
}
