import type { Transaction } from "@/lib/types/transaction";
import { API_BASE_URL, PAGE_SIZE } from "@/config/constants";

export interface TransactionFilters {
  status?: string[];
  category?: string | null;
  search?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
}

interface FetchTransactionsParams {
  pageParam?: number;
  filters?: TransactionFilters;
}

export async function fetchTransactions({
  pageParam = 1,
  filters = {},
}: FetchTransactionsParams): Promise<Transaction[]> {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: PAGE_SIZE.toString(),
  });

  if (filters.category) {
    params.append("category", filters.category);
  }

  if (filters.search) {
    params.append("search", filters.search);
  }

  const response = await fetch(`${API_BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }

  let data: Transaction[] = await response.json();

  if (filters.status && filters.status.length > 0) {
    data = data.filter((t) => {
      const s = t.status ? "success" : "failed";
      return filters.status!.includes(s);
    });
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    data = data.filter((t) => new Date(t.createdAt).getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime() + 86_400_000; // end of day
    data = data.filter((t) => new Date(t.createdAt).getTime() < to);
  }

  return data;
}
