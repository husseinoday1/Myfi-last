export interface Debt {
  id: number;
  userId: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  status: "active" | "paid" | "cancelled";
  dateTaken: Date;
  dueDate: Date | null;
  createdAt: Date;
}

export interface DebtPayment {
  id: number;
  debtId: number;
  transactionId: number;
  amount: number;
  date: Date;
  description: string | null;
  createdAt: Date;
}

export interface CreateDebtRequest {
  name: string;
  totalAmount: number;
  dateTaken: Date;
  dueDate?: Date;
}

export interface UpdateDebtRequest {
  id: number;
  name?: string;
  totalAmount?: number;
  status?: "active" | "paid" | "cancelled";
  dueDate?: Date;
}

export interface AddPaymentRequest {
  debtId: number;
  amount: number;
  date: Date;
  description?: string;
}
