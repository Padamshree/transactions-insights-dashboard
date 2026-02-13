"use client";

import { memo } from "react";
import type { Transaction } from "@/lib/types/transaction";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";

export const TransactionCard = memo(function TransactionCard({
  transaction,
}: {
  transaction: Transaction;
}) {
  const statusLabel = transaction.status ? "Success" : "Failed";

  return (
    <article className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <img
        src={transaction.avatar}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full bg-slate-200 object-cover dark:bg-slate-700"
        loading="lazy"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900 dark:text-slate-100">
              {transaction.name}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ID: {transaction.id}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Created:{" "}
              {format(new Date(transaction.createdAt), "d MMM yyyy")}
            </p>
          </div>
          <p className="shrink-0 text-right font-semibold text-slate-900 dark:text-slate-100">
            {transaction.currency}
            {parseFloat(transaction.amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            {transaction.category}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              transaction.status
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </article>
  );
});
