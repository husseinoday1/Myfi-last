export interface Transaction {
  id: number;
  userId: string;
  type: "income" | "expense" | "carryover";
  categoryId: number | null;
  amount: number;
  description: string | null;
  date: Date;
  receiptFile: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  type: "income" | "expense" | "carryover";
  categoryId?: number;
  amount: number;
  description?: string;
  date: Date;
}

export interface UpdateTransactionRequest {
  id: number;
  categoryId?: number;
  amount?: number;
  description?: string;
  date?: Date;
}
