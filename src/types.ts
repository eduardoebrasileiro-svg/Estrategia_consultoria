export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Summary {
  balance: number;
  income: number;
  expenses: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  status: 'pending' | 'achieved' | 'failed';
}

export interface Instruction {
  id: string;
  content: string;
  sentAt: any;
  read: boolean;
}

export interface LinkedUser {
  uid: string;
  email: string;
  displayName: string;
  cpf: string;
  adminId?: string;
}
