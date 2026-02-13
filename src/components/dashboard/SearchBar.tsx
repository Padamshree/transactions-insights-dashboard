"use client";

import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Search, X } from "lucide-react";
import { DEBOUNCE_MS } from "@/config/constants";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useDebouncedCallback((val: string) => {
    onChange(val);
  }, DEBOUNCE_MS);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (val: string) => {
    setLocalValue(val);
    debouncedOnChange(val);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by name or ID..."
        aria-label="Search transactions"
        className="w-full cursor-text rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-500"
      />
      {localValue && (
        <button
          onClick={() => handleChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
