export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: Date;
  category?: string;
  status: ExpenseStatus;
  isGreen: boolean;
  confidenceScore?: number;
  greenCategory?: string;
  metadata?: Record<string, any>;
  receipt?: string;
  tags?: string;
  vendor?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface ExpenseCreateDTO {
  amount: number;
  description: string;
  date: Date;
  category?: string;
  receipt?: string;
  tags?: string;
  vendor?: string;
  metadata?: Record<string, any>;
}

export interface ExpenseUpdateDTO {
  amount?: number;
  description?: string;
  date?: Date;
  category?: string;
  status?: ExpenseStatus;
  isGreen?: boolean;
  greenCategory?: string;
  receipt?: string;
  tags?: string;
  vendor?: string;
  metadata?: Record<string, any>;
}

export interface ExpenseClassificationResult {
  isGreen: boolean;
  confidenceScore: number;
  greenCategory?: string;
  reasons?: string[];
} 