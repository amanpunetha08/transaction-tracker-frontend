// Matches Django Transaction model
export interface Transaction {
  id: number;
  amount: number;
  type: "debit" | "credit";
  merchant: string;
  date: string; // ISO format: "2026-04-20"
}

// Response from /api/summary/
export interface Summary {
  total_debit: number;
  total_credit: number;
  by_merchant: { merchant: string; total: number }[];
}

// Response from /api/transactions/
export interface TransactionsResponse {
  transactions: Transaction[];
}
