"use client";

import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { Filter, Check, X, Calendar } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils/cn";
import { format, parse } from "date-fns";
import type { TransactionFilters } from "@/lib/api/transactions";

const STATUS_OPTIONS = [
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "deposit", label: "Deposit" },
  { value: "payment", label: "Payment" },
  { value: "invoice", label: "Invoice" },
] as const;

interface FilterPanelProps {
  filters: TransactionFilters;
  onFilterChange: (updates: Partial<TransactionFilters>) => void;
  onClear: () => void;
  searchSlot: React.ReactNode;
}

function FilterPopover({
  statusSelected,
  categorySelected,
  onStatusChange,
  onCategoryChange,
}: {
  statusSelected: string[];
  categorySelected: string | null;
  onStatusChange: (value: string[]) => void;
  onCategoryChange: (value: string | null) => void;
}) {
  const hasFilters = statusSelected.length > 0 || !!categorySelected;

  function toggleStatus(value: string) {
    if (statusSelected.includes(value)) {
      onStatusChange(statusSelected.filter((s) => s !== value));
    } else {
      onStatusChange([...statusSelected, value]);
    }
  }

  return (
    <Popover className="relative">
      <PopoverButton
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
          hasFilters
            ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
            : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        )}
      >
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">
          {hasFilters ? "Filtered" : "Filters"}
        </span>
      </PopoverButton>

      <PopoverPanel
        anchor="bottom end"
        className="z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800"
      >
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Status
        </p>
        <div className="space-y-1">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = statusSelected.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleStatus(option.value)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border",
                    isSelected
                      ? "border-slate-900 bg-slate-900 dark:border-slate-100 dark:bg-slate-100"
                      : "border-slate-300 dark:border-slate-600"
                  )}
                >
                  {isSelected && (
                    <Check className="h-3 w-3 text-white dark:text-slate-900" />
                  )}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <hr className="my-3 border-slate-200 dark:border-slate-700" />

        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Category
        </p>
        <div className="space-y-1">
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected =
              option.value === ""
                ? !categorySelected
                : categorySelected === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onCategoryChange(option.value || null)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="h-4 w-4" />
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverPanel>
    </Popover>
  );
}

const DATE_FORMAT = "yyyy-MM-dd";

function toDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  return parse(value, DATE_FORMAT, new Date());
}

function DateRangePopover({
  dateFrom,
  dateTo,
  onChange,
}: {
  dateFrom: string | null;
  dateTo: string | null;
  onChange: (updates: { dateFrom?: string | null; dateTo?: string | null }) => void;
}) {
  const hasDate = dateFrom || dateTo;
  const defaultClassNames = getDefaultClassNames();
  const today = new Date();

  const selected: DateRange | undefined =
    dateFrom || dateTo
      ? { from: toDate(dateFrom), to: toDate(dateTo) }
      : undefined;

  function handleSelect(range: DateRange | undefined) {
    onChange({
      dateFrom: range?.from ? format(range.from, DATE_FORMAT) : null,
      dateTo: range?.to ? format(range.to, DATE_FORMAT) : null,
    });
  }

  return (
    <Popover className="relative">
      <PopoverButton
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
          hasDate
            ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
            : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        )}
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">
          {hasDate ? "Date set" : "Date"}
        </span>
      </PopoverButton>

      <PopoverPanel
        anchor="bottom end"
        className="z-50 mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800"
      >
        <DayPicker
          mode="range"
          selected={selected}
          onSelect={handleSelect}
          disabled={{ after: today }}
          classNames={{
            root: `${defaultClassNames.root} text-sm`,
            today: "font-bold border border-slate-400 dark:border-slate-500",
            selected: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
            range_start: "bg-slate-900 text-white rounded-l-full dark:bg-slate-100 dark:text-slate-900",
            range_end: "bg-slate-900 text-white rounded-r-full dark:bg-slate-100 dark:text-slate-900",
            range_middle: "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100",
            chevron: `${defaultClassNames.chevron} !fill-slate-900 dark:!fill-slate-100`,
          }}
        />
        {hasDate && (
          <button
            onClick={() => onChange({ dateFrom: null, dateTo: null })}
            className="mt-1 w-full cursor-pointer text-center text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear dates
          </button>
        )}
      </PopoverPanel>
    </Popover>
  );
}

export function FilterPanel({
  filters,
  onFilterChange,
  onClear,
  searchSlot,
}: FilterPanelProps) {
  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    filters.category ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="flex gap-3 items-center justify-between">
      <div className="w-full sm:w-64">{searchSlot}</div>

      <div className="flex items-center gap-2">
        <FilterPopover
          statusSelected={filters.status ?? []}
          categorySelected={filters.category ?? null}
          onStatusChange={(value) => onFilterChange({ status: value })}
          onCategoryChange={(value) => onFilterChange({ category: value })}
        />
        <DateRangePopover
          dateFrom={filters.dateFrom ?? null}
          dateTo={filters.dateTo ?? null}
          onChange={onFilterChange}
        />
        {hasActiveFilters && (
          <button
            onClick={onClear}
            aria-label="Clear all filters"
            className="shrink-0 cursor-pointer rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
