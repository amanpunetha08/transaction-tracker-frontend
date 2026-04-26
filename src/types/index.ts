export interface Transaction {
  id: number;
  amount: number;
  type: "debit" | "credit";
  merchant: string;
  date: string;
  account_email?: string;
  is_duplicate?: boolean;
}

export interface Summary {
  total_debit: number;
  total_credit: number;
  by_merchant: { merchant: string; total: number }[];
}

export interface TransactionsResponse {
  transactions: Transaction[];
}
