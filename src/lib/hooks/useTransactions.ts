"use client";

import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams, usePathname } from "next/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";
import { fetchTransactions, type TransactionFilters } from "@/lib/api/transactions";

const DEFAULT_FILTERS: TransactionFilters = {
  status: [],
  category: null,
  search: "",
  dateFrom: null,
  dateTo: null,
};

function filtersFromParams(params: URLSearchParams): TransactionFilters {
  return {
    status: params.get("status")?.split(",").filter(Boolean) ?? [],
    category: params.get("category") ?? null,
    search: params.get("search") ?? "",
    dateFrom: params.get("dateFrom") ?? null,
    dateTo: params.get("dateTo") ?? null,
  };
}

function filtersToQuery(filters: TransactionFilters): string {
  const params = new URLSearchParams();
  if (filters.status && filters.status.length > 0)
    params.set("status", filters.status.join(","));
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  return params.toString();
}

export function useTransactionFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [filters, setFiltersState] = useState<TransactionFilters>(() =>
    filtersFromParams(searchParams)
  );

  const setFilters = useCallback((updates: Partial<TransactionFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  useEffect(() => {
    const query = filtersToQuery(filters);
    const newUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, "", newUrl);
  }, [filters, pathname]);

  return { filters, setFilters, clearFilters };
}

export function useTransactions(filters: TransactionFilters) {
  const query = useInfiniteQuery({
    queryKey: ["transactions", filters],
    queryFn: ({ pageParam }) => fetchTransactions({ pageParam, filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length > 0 ? allPages.length + 1 : undefined,
    placeholderData: keepPreviousData,
  });

  const transactions = useMemo(
    () => query.data?.pages.flatMap((page) => page) ?? [],
    [query.data]
  );

  return { ...query, transactions };
}
