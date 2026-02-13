"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

interface InfiniteScrollWrapperProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  loadingIndicator?: React.ReactNode;
  endIndicator?: React.ReactNode;
  className?: string;
}

export function InfiniteScrollWrapper({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.7,
  loadingIndicator,
  endIndicator,
  className,
}: InfiniteScrollWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } =
      document.documentElement;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= threshold) {
      loadMoreRef.current();
    }
  }, [isLoading, hasMore, threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const docHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    if (docHeight <= viewportHeight) {
      loadMoreRef.current();
    }
  }, [hasMore, isLoading, children]);

  return (
    <div ref={containerRef}>
      <div className={cn(className)}>{children}</div>

      {isLoading &&
        (loadingIndicator ?? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ))}

      {!hasMore && !isLoading &&
        (endIndicator ?? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            👍 No more transactions
          </p>
        ))}
    </div>
  );
}
