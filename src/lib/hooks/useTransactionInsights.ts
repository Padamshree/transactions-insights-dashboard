import { useMemo } from "react";
import type { Transaction } from "@/lib/types/transaction";

export interface TransactionInsights {
  totalCount: number;
  successfulAmount: number;
  successRate: number;
  topCategory: string;
}

export function useTransactionInsights(
  transactions: Transaction[]
): TransactionInsights {
  return useMemo(() => {
    const total = transactions.length;

    const successful = transactions.filter((t) => t.status === true);
    const successfulAmount = successful.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );

    const successRate = total > 0 ? (successful.length / total) * 100 : 0;

    const categoryTotals = transactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    const topRaw =
      Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      "N/A";
    const topCategory =
      topRaw !== "N/A"
        ? topRaw.charAt(0).toUpperCase() + topRaw.slice(1)
        : topRaw;

    return { totalCount: total, successfulAmount, successRate, topCategory };
  }, [transactions]);
}
