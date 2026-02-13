import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/getQueryClient";
import { fetchTransactions } from "@/lib/api/transactions";
import { TransactionDashboard } from "@/components/dashboard/TransactionDashboard";

export default async function HomePage() {
  const queryClient = getQueryClient();

  const defaultFilters = {
    status: [] as string[],
    category: null,
    search: "",
    dateFrom: null,
    dateTo: null,
  };

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["transactions", defaultFilters],
    queryFn: ({ pageParam }) =>
      fetchTransactions({ pageParam, filters: defaultFilters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: unknown[], allPages: unknown[][]) =>
      (lastPage as unknown[]).length > 0 ? allPages.length + 1 : undefined,
    pages: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionDashboard />
    </HydrationBoundary>
  );
}
