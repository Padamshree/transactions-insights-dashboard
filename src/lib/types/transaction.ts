export interface Transaction {
  id: string;
  createdAt: string;
  name: string;
  avatar: string;
  amount: string;
  currency: string;
  category: "withdrawal" | "deposit" | "payment" | "invoice";
  status: boolean;
}

export type TransactionStatus = "success" | "failed";
