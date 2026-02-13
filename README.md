# Transaction Insights Dashboard

A responsive financial transaction dashboard built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Features infinite scrolling, real-time aggregated insights, advanced filtering, and dark mode support.

## Live Demo

> _Link will be added after deployment_

## Setup

### Prerequisites

- Node.js 18+ (20 recommended)
- npm

### Installation

```bash
git clone https://github.com/<your-username>/transactions-insights-dashboard.git
cd transactions-insights-dashboard
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Architecture

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR prefetching, file-based routing, React Server Components |
| Language | TypeScript (strict) | Type safety across API boundaries and component props |
| Styling | Tailwind CSS v4 | Utility-first, dark mode via class strategy, zero runtime |
| Data Fetching | TanStack Query v5 | `useInfiniteQuery` for pagination, automatic caching, `keepPreviousData` for smooth filter transitions |
| Theme | next-themes | Zero-flash dark mode, system preference detection, ~1KB |
| UI Primitives | Headless UI | Accessible popovers for filters — unstyled, composable with Tailwind |
| Date Picker | react-day-picker v9 | Built-in range mode, handles all date validation/selection internally |
| Date Utils | date-fns | Tree-shakeable formatting and parsing |
| Icons | lucide-react | Tree-shakeable, consistent design language |
| Debounce | use-debounce | Lightweight debounced search (300ms) |

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers, header, metadata
│   ├── page.tsx            # Server Component — SSR prefetches first page
│   ├── providers.tsx       # QueryClient + ThemeProvider (client)
│   └── globals.css
├── components/
│   ├── dashboard/
│   │   ├── TransactionDashboard.tsx   # Main orchestrator
│   │   ├── TransactionCard.tsx        # Memoized transaction display
│   │   ├── InsightCard.tsx            # Single metric card
│   │   ├── FilterPanel.tsx            # Filter + date popovers
│   │   └── SearchBar.tsx              # Debounced search input
│   ├── wrappers/
│   │   └── InfiniteScrollWrapper.tsx  # Reusable scroll-triggered loader
│   ├── ui/
│   │   ├── Skeleton.tsx               # Loading skeletons
│   │   └── ErrorBoundary.tsx          # Catch-all error UI with retry
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Container.tsx
│   └── theme/
│       └── ThemeToggle.tsx
├── lib/
│   ├── api/
│   │   └── transactions.ts           # API client + client-side filtering
│   ├── hooks/
│   │   ├── useTransactions.ts         # Infinite query + URL state sync
│   │   └── useTransactionInsights.ts  # Derived metrics via useMemo
│   ├── query/
│   │   └── getQueryClient.ts          # Server-side query client (React cache)
│   ├── types/
│   │   └── transaction.ts
│   └── utils/
│       └── cn.ts                      # clsx + tailwind-merge
└── config/
    └── constants.ts                   # API URL, page size, debounce, scroll threshold
```

### Data Flow

```
Server (page.tsx)
  └─ prefetchInfiniteQuery(page 1)
      └─ HydrationBoundary → dehydrated cache to client

Client (TransactionDashboard)
  └─ useTransactionFilters()
      ├─ Local state for instant reactivity
      └─ Syncs to URL via history.replaceState (shareable links)
  └─ useTransactions(filters)
      ├─ useInfiniteQuery with keepPreviousData
      ├─ queryKey: ["transactions", filters] — auto-refetch on filter change
      └─ Client-side filtering for status + date range (API limitations)
  └─ useTransactionInsights(transactions)
      └─ useMemo: totalCount, successfulAmount, successRate, topCategory
  └─ InfiniteScrollWrapper
      └─ Scroll listener at 70% threshold → fetchNextPage()
```

### Key Design Decisions

**SSR Prefetching with HydrationBoundary** — The server component in `page.tsx` prefetches the first page of transactions. The client picks up the hydrated cache instantly — no loading spinner on first visit. Subsequent pages are fetched client-side as the user scrolls.

**URL State for Filters** — Filter state lives in component state for instant reactivity, but is mirrored to the URL via `history.replaceState`. This means filter combinations are shareable as links and browser back/forward works, without the overhead of Next.js router navigations.

**Reusable InfiniteScrollWrapper** — Scroll detection logic is decoupled into a generic wrapper with configurable threshold, loading, and end indicators. This separates scroll mechanics from business logic and is reusable across any list.

**React.memo on TransactionCard** — Since the transaction list can grow to hundreds of items via infinite scroll, memoizing the card prevents re-renders when new pages are appended or filters change.

## Trade-Offs

### react-day-picker vs Native Date Inputs

Initially used native `<input type="date">` for zero bundle cost. Switched to **react-day-picker** (~15KB) because:
- Native inputs required extensive manual validation (5-6 digit years, from/to constraints, future date blocking)
- Cross-browser date input UX is inconsistent
- react-day-picker provides built-in range mode, disabled dates, and consistent styling across browsers
- Eliminated ~80 lines of custom date validation code

**Trade-off**: +15KB bundle for significantly less code to maintain and better UX.

### Client-Side Filtering vs Server-Side

The MockAPI has limited query support — no status filter and no date range params. Rather than building a proxy API route, filtering happens client-side after fetch. This means:
- **Pro**: Simple, no additional server infrastructure
- **Con**: Fetches more data than needed when status/date filters are active
- **Acceptable because**: Page size is 20, and client-side filtering on 20 items is negligible

### TanStack Query vs SWR

Chose TanStack Query since this is something worked with recently and for it having excellent paginated support with `useInfiniteQuery`, `keepPreviousData` for smooth filter transitions, and `HydrationBoundary` for SSR. SWR would be ~15KB lighter but lacks these features out of the box.

### Headless UI vs Radix UI

Chose Headless UI for its simpler API for the components needed (Popover only) and smaller footprint for this use case.

### URL State vs Zustand/Context

URL state adds no dependencies and provides shareability + browser navigation for free. `history.replaceState` but becomes complex to handle with growing, repeated updates something which can be better hadled through zustand or redux but given scale of operations for this project, choose to keep it simple.

### No Virtualization

The list grows via infinite scroll but TanStack Virtual was not added. Virtualization should be the next step for scalability but chose to not undertake it here since offers no tangible benefits but is always ready to be used in scalable/production apps

## Features

- **Infinite Scroll** — Loads next page at 70% scroll depth; auto-fetches if content is shorter than viewport
- **Aggregated Insights** — Total count, successful amount, success rate, top category — updates as pages load
- **Filters** — Multi-select status, single-select category, date range picker
- **Debounced Search** — 300ms debounce on name/ID search
- **Dark Mode** — System preference detection, persistent toggle, zero-flash on load
- **SSR** — First page prefetched on server for instant render
- **Responsive** — Mobile single-column, tablet 2-column, desktop 3-column grid
- **Error Handling** — Error boundary with retry, inline error states, empty states
- **Semantic HTML** — `<main>`, `<section>`, `<article>`, ARIA labels, screen-reader-only headings
- **Shareable URLs** — Filter state synced to URL query params
