"use client";

import { Suspense } from "react";
import {
  useTransactions,
  useTransactionFilters,
} from "@/lib/hooks/useTransactions";
import { useTransactionInsights } from "@/lib/hooks/useTransactionInsights";
import { InfiniteScrollWrapper } from "@/components/wrappers/InfiniteScrollWrapper";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Container } from "@/components/layout/Container";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { TransactionCard } from "@/components/dashboard/TransactionCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import {
  TransactionCardSkeleton,
  InsightCardSkeleton,
} from "@/components/ui/Skeleton";
import { SCROLL_THRESHOLD } from "@/config/constants";
import { Inbox } from "lucide-react";

function DashboardContent() {
  const { filters, setFilters, clearFilters } = useTransactionFilters();

  const {
    transactions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  } = useTransactions(filters);
  const insights = useTransactionInsights(transactions);

  const isRefetching = isFetching && !isLoading && !isFetchingNextPage;

  return (
    <>
      <div className="sticky top-[57px] z-40 -mx-4 mb-8 bg-white/80 px-4 py-4 backdrop-blur-sm dark:bg-slate-900/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <section aria-labelledby="insights-heading">
          <h2 id="insights-heading" className="sr-only">
            Insights
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <InsightCardSkeleton key={i} />
              ))
            ) : (
              <>
                <InsightCard
                  label="Total Transactions"
                  value={insights.totalCount}
                />
                <InsightCard
                  label="Successful Amount"
                  value={`$${insights.successfulAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <InsightCard
                  label="Success Rate"
                  value={`${insights.successRate.toFixed(1)}%`}
                />
                <InsightCard
                  label="Top Category"
                  value={insights.topCategory}
                />
              </>
            )}
          </div>
        </section>

        <section aria-labelledby="filters-heading" className="mt-4">
          <h2 id="filters-heading" className="sr-only">
            Search and Filters
          </h2>
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onClear={clearFilters}
            searchSlot={
              <SearchBar
                value={filters.search ?? ""}
                onChange={(search) => setFilters({ search })}
              />
            }
          />
        </section>
      </div>

      <section aria-labelledby="transactions-content">

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TransactionCardSkeleton key={i} />
            ))}
          </div>
        ) : isError || transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
            <Inbox className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            <div className="text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {isError ? "Failed to load transactions" : "No transactions found"}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isError
                  ? (error?.message ?? "Something went wrong. Please try again.")
                  : "Try adjusting your search or filters."}
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="mt-2 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="relative">
            {isRefetching && (
              <div className="absolute inset-0 z-10 rounded-lg bg-white/60 dark:bg-slate-900/60" />
            )}
            <InfiniteScrollWrapper
              onLoadMore={() => fetchNextPage()}
              hasMore={hasNextPage ?? false}
              isLoading={isFetchingNextPage}
              threshold={SCROLL_THRESHOLD}
              className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
            >
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </InfiniteScrollWrapper>
          </div>
        )}
      </section>
    </>
  );
}

export function TransactionDashboard() {
  return (
    <main className="py-2">
      <Container>
        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <InsightCardSkeleton key={i} />
                ))}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TransactionCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <ErrorBoundary>
            <DashboardContent />
          </ErrorBoundary>
        </Suspense>
      </Container>
    </main>
  );
}
