export interface Category {
  id: number;
  userId: string;
  name: string;
  type: "income" | "expense";
  isFixed: boolean;
  createdAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  type: "income" | "expense";
  isFixed: boolean;
}

export interface UpdateCategoryRequest {
  id: number;
  name?: string;
  isFixed?: boolean;
}
