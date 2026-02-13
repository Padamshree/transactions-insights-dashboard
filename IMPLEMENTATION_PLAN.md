# Transaction Insights Dashboard - Implementation Plan

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Component Architecture](#component-architecture)
- [State Management Strategy](#state-management-strategy)
- [Performance Optimizations](#performance-optimizations)
- [Mobile-First Responsive Design](#mobile-first-responsive-design)

---

## 🛠 Tech Stack

### Core Framework
- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling

### Suggested Libraries

#### Data Fetching & Caching
- **TanStack Query (React Query)** v5
  - Automatic caching & background refetching
  - Built-in pagination support
  - Optimistic updates
  - Request deduplication
  - Alternative: SWR (lighter but less features)

#### Theme Management
- **next-themes**
  - Zero-flash dark mode for Next.js
  - System preference detection
  - Persistent theme selection
  - Works perfectly with Tailwind's dark mode
  - Only ~1KB

#### Infinite Scrolling
- **TanStack Virtual** (formerly react-virtual)
  - Virtualization for performance with large lists
  - Smooth infinite scroll
  - Alternative: react-window or custom Intersection Observer

#### Form & Filter Management
- **React Hook Form** v7
  - Performant form state management
  - Easy validation
  - Alternative: Formik or native React state

#### Date Handling
- **date-fns**
  - Lightweight, tree-shakeable
  - Date range filtering & formatting
  - Alternative: Day.js

#### UI Components (Optional)
- **Headless UI** or **Radix UI**
  - Accessible multi-select dropdowns
  - Date pickers
  - Already unstyled, works perfectly with Tailwind
  - Alternative: Build custom components

#### Debouncing
- **use-debounce** hook
  - Simple debounced search
  - Alternative: lodash.debounce or custom hook

#### Icons
- **Lucide React** or **Heroicons**
  - Tree-shakeable
  - Works great with Tailwind

#### PWA Support
- **@ducanh2912/next-pwa**
  - Modern PWA plugin for Next.js App Router
  - Service worker generation
  - Offline support
  - Install prompts
  - ~5KB runtime

---

## 📁 Project Structure

```
root/
├── next.config.js (PWA configuration)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   ├── manifest.ts (PWA manifest)
│   │   └── globals.css
│   ├── public/
│   │   ├── icons/
│   │   │   ├── icon-192x192.png
│   │   │   ├── icon-512x512.png
│   │   │   └── apple-touch-icon.png
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionCard.tsx
│   │   │   ├── InsightsSummary.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   └── OfflineIndicator.tsx
│   │   ├── wrappers/
│   │   │   └── InfiniteScrollWrapper.tsx
│   │   ├── theme/
│   │   │   └── ThemeToggle.tsx
│   │   ├── pwa/
│   │   │   └── InstallPrompt.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Container.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   └── transactions.ts
│   │   ├── hooks/
│   │   │   ├── useTransactions.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   └── useTransactionInsights.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── calculations.ts
│   │   │   └── cn.ts (classname utility)
│   │   ├── query/
│   │   │   └── getQueryClient.ts (Server-side query client)
│   │   └── types/
│   │       └── transaction.ts
│   └── config/
│       └── constants.ts
```

---

## 🎨 Theme System (Light/Dark Mode)

### Implementation Strategy

**Library**: `next-themes`
- Zero-flash dark mode (no white flash on page load)
- Automatic system preference detection
- Persistent theme selection (localStorage)
- SSR-compatible

### Setup Steps

**1. Tailwind Configuration**
```javascript
// tailwind.config.ts
export default {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#0f172a', // slate-900
        },
        foreground: {
          light: '#0f172a',
          dark: '#f1f5f9', // slate-100
        },
        card: {
          light: '#f8fafc', // slate-50
          dark: '#1e293b', // slate-800
        },
        // ... other theme colors
      },
    },
  },
};
```

**2. Providers Setup**
```typescript
// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

**3. Root Layout**
```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**4. Theme Toggle Component**
```typescript
// components/theme/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 shadow-sm'
            : 'hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 shadow-sm'
            : 'hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 shadow-sm'
            : 'hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
```

**5. Usage in Header**
```typescript
// components/layout/Header.tsx
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Transaction Dashboard</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
```

### Dark Mode Design Tokens

**Color Palette Strategy:**
```typescript
// Use Tailwind's dark: modifier for all components
<div className="bg-white dark:bg-slate-900">
  <div className="bg-slate-50 dark:bg-slate-800"> {/* Cards */}
    <h2 className="text-slate-900 dark:text-slate-100"> {/* Text */}
    <p className="text-slate-600 dark:text-slate-400"> {/* Secondary text */}
    <div className="border-slate-200 dark:border-slate-700"> {/* Borders */}
  </div>
</div>
```

**Component Examples:**

**Transaction Card (Themed)**
```typescript
<article className="
  bg-white dark:bg-slate-800
  border border-slate-200 dark:border-slate-700
  rounded-lg p-4
  hover:shadow-lg dark:hover:shadow-slate-900/50
  transition-shadow
">
  <h3 className="text-slate-900 dark:text-slate-100 font-semibold">
    {transaction.name}
  </h3>
  <p className="text-slate-600 dark:text-slate-400 text-sm">
    {formatDate(transaction.createdAt)}
  </p>
</article>
```

**Status Badges (Themed)**
```typescript
const statusStyles = {
  success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
};
```

### Benefits
- ✅ Zero-flash on page load (SSR-safe)
- ✅ Respects system preferences
- ✅ Persistent user choice
- ✅ Smooth transitions
- ✅ Accessible (proper ARIA labels)
- ✅ Only ~1KB bundle size

---

## 📱 PWA (Progressive Web App) Setup

### Why PWA for This Dashboard?

**Perfect Use Case:**
- ✅ Users can **install** the dashboard on mobile/desktop
- ✅ **Offline access** to previously viewed transactions
- ✅ **Faster repeat visits** with cached assets
- ✅ **App-like experience** (fullscreen, splash screen)
- ✅ **No app store** required

### Implementation (Minimal Changes Required!)

**1. Install PWA Plugin**
```bash
npm install @ducanh2912/next-pwa
```

**2. Next.js Configuration**
```javascript
// next.config.js
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable in dev
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/696e0139d7bacd2dd7155c6a\.mockapi\.io\/.*/i,
      handler: 'NetworkFirst', // Try network, fallback to cache
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst', // Images: cache first
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Your existing Next.js config
  reactStrictMode: true,
});
```

**3. Web App Manifest**
```typescript
// app/manifest.ts (Next.js 15 metadata API)
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Transaction Insights Dashboard',
    short_name: 'Transactions',
    description: 'Financial transaction insights with infinite scroll',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // slate-900 (dark mode)
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    orientation: 'portrait-primary',
    categories: ['finance', 'productivity'],
  };
}
```

**4. Update Root Layout (Metadata)**
```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Transaction Insights Dashboard',
  description: 'Financial transaction insights with infinite scroll',
  manifest: '/manifest.json', // Auto-generated from manifest.ts
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Transactions',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA meta tags are auto-injected by Next.js */}
      </head>
      <body className="bg-white dark:bg-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**5. Install Prompt (Optional - Client Component)**
```typescript
// components/pwa/InstallPrompt.tsx
'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Install App</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Install this dashboard for quick access and offline support
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Install
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**6. Add to Main Layout**
```typescript
// app/layout.tsx
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
```

### Caching Strategy

**NetworkFirst** (for API calls):
- Try to fetch from network
- If network fails or slow → use cache
- Update cache in background
- **Perfect for**: Transaction data (fresh when online, cached when offline)

**CacheFirst** (for static assets):
- Check cache first
- If not in cache → fetch from network
- **Perfect for**: Images, fonts, CSS, JS

**StaleWhileRevalidate** (optional):
- Return cached version immediately
- Fetch fresh data in background
- Update cache for next visit

### Offline Experience

**What Works Offline:**
- ✅ Previously viewed transactions (cached)
- ✅ UI and navigation
- ✅ Filter/search on cached data
- ✅ Theme toggle
- ✅ Insights calculation on cached data

**What Doesn't:**
- ❌ Fetching new transactions
- ❌ Infinite scroll (when cache exhausted)

**Offline Indicator (Optional):**
```typescript
// components/ui/OfflineIndicator.tsx
'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm z-50">
      <WifiOff className="inline h-4 w-4 mr-2" />
      You're offline. Showing cached data.
    </div>
  );
}
```

### Testing PWA

**Local Testing:**
1. Build for production: `npm run build`
2. Start production server: `npm start`
3. Open DevTools → Application → Service Workers
4. Open DevTools → Application → Manifest
5. Test "Add to Home Screen"

**Lighthouse Audit:**
```bash
# Check PWA score
npx lighthouse http://localhost:3000 --view
```

**PWA Checklist:**
- ✅ HTTPS (auto with Vercel)
- ✅ Service worker registered
- ✅ Web app manifest
- ✅ Icons (192x192, 512x512)
- ✅ Offline fallback
- ✅ Mobile responsive

### Benefits Summary

| Feature | Without PWA | With PWA |
|---------|------------|----------|
| **Install** | ❌ No | ✅ Yes (home screen) |
| **Offline** | ❌ Nothing | ✅ Cached data |
| **Speed** | Normal | ✅ Faster (cached assets) |
| **App Feel** | Browser | ✅ Fullscreen app |
| **Code Changes** | - | ✅ Minimal (config only) |

### Is It Worth It?

**Yes, if:**
- ✅ Users access dashboard frequently
- ✅ Mobile usage is expected
- ✅ Offline access adds value
- ✅ You want app-like UX

**Skip if:**
- ❌ Desktop-only internal tool
- ❌ Always-online requirement
- ❌ No time for icon creation

**Verdict**: ⭐ **Highly Recommended** - 30 min setup, significant UX improvement

---

## 🔄 SSR Strategy with TanStack Query

### Server + Client Component Architecture

**Critical Pattern**: Leverage Next.js App Router's hybrid rendering for optimal performance:
- ✅ **Server Components** fetch initial data (SEO, faster FCP)
- ✅ **Client Components** handle interactivity (infinite scroll, filters)
- ✅ **TanStack Query** bridges server and client seamlessly

### Implementation Steps

**1. Server-Side Query Client**
```typescript
// lib/query/getQueryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

// Create a singleton query client per request (using React cache)
export const getQueryClient = cache(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    },
  },
}));
```

**2. Update Providers (Client)**
```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create query client on the client (one per session)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

**3. Server Component (Page) - Prefetch Data**
```typescript
// app/page.tsx (Server Component)
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/getQueryClient';
import { fetchTransactions } from '@/lib/api/transactions';
import { TransactionDashboard } from '@/components/dashboard/TransactionDashboard';

export default async function HomePage({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const queryClient = getQueryClient();

  // Parse filters from URL
  const filters = {
    status: searchParams.status?.toString().split(',') ?? [],
    category: searchParams.category?.toString() ?? null,
    search: searchParams.search?.toString() ?? '',
  };

  // Prefetch first page on the server
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: ({ pageParam = 1 }) => fetchTransactions({
      pageParam,
      filters
    }),
    initialPageParam: 1,
    pages: 1, // Only prefetch first page
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionDashboard />
    </HydrationBoundary>
  );
}
```

**4. Client Component - Hydrate & Continue**
```typescript
// components/dashboard/TransactionDashboard.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { fetchTransactions } from '@/lib/api/transactions';
import { TransactionList } from './TransactionList';
import { InsightsSummary } from './InsightsSummary';

export function TransactionDashboard() {
  const searchParams = useSearchParams();

  const filters = useMemo(() => ({
    status: searchParams.get('status')?.split(',') ?? [],
    category: searchParams.get('category') ?? null,
    search: searchParams.get('search') ?? '',
  }), [searchParams]);

  // This hook will:
  // 1. Hydrate from server-prefetched data (instant first render)
  // 2. Allow client-side infinite scroll to fetch subsequent pages
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: ({ pageParam }) => fetchTransactions({ pageParam, filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Assuming API returns empty array when no more data
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
  });

  // Flatten all pages into single array
  const transactions = useMemo(
    () => data?.pages.flatMap(page => page) ?? [],
    [data]
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <InsightsSummary transactions={transactions} />
      <TransactionList
        data={data}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
      />
    </main>
  );
}
```

**5. API Client**
```typescript
// lib/api/transactions.ts
import { Transaction } from '@/lib/types/transaction';

const API_BASE_URL = 'https://696e0139d7bacd2dd7155c6a.mockapi.io/barter-tech/transactions';

export async function fetchTransactions({
  pageParam = 1,
  filters
}: {
  pageParam: number;
  filters: {
    status?: string[];
    category?: string | null;
    search?: string;
  };
}): Promise<Transaction[]> {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: '20',
  });

  // Add filters if present
  if (filters.category) {
    params.append('category', filters.category);
  }

  if (filters.search) {
    params.append('search', filters.search);
  }

  const url = `${API_BASE_URL}?${params}`;

  const response = await fetch(url, {
    // Important for server-side fetching
    cache: 'no-store', // or 'force-cache' with revalidate
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }

  const data: Transaction[] = await response.json();

  // Client-side filtering for status (if API doesn't support it)
  // Note: API returns status as boolean, so we filter after fetching
  if (filters.status && filters.status.length > 0) {
    return data.filter(transaction => {
      // Map boolean to status string
      const transactionStatus = transaction.status ? 'success' : 'failed';
      return filters.status!.includes(transactionStatus);
    });
  }

  return data;
}
```

### Benefits of This Approach

| Aspect | Server Prefetch | Client Hydration |
|--------|----------------|------------------|
| **First Paint** | ✅ Instant (SSR) | - |
| **SEO** | ✅ Full content | - |
| **Interactivity** | - | ✅ Infinite scroll |
| **Data Freshness** | ✅ Revalidate | ✅ Background refetch |
| **Navigation** | ✅ Back/forward | ✅ Cached |

### Key Concepts

**HydrationBoundary**:
- Transfers server-fetched data to client
- Zero duplicate requests on initial load
- Client picks up where server left off

**Query Key Matching**:
- Server and client use **identical query keys**
- Ensures proper hydration
- `['transactions', filters]` must match exactly

**Infinite Query Continuation**:
- Server prefetches page 1
- Client displays page 1 instantly (from cache)
- User scrolls → Client fetches page 2, 3, etc.
- No re-fetching page 1!

### Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. User requests page                                   │
│    URL: /?category=withdrawal                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Server Component (page.tsx)                          │
│    - Parse searchParams                                 │
│    - prefetchInfiniteQuery(page=1)                      │
│    - Render HTML with data                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. HydrationBoundary                                    │
│    - Dehydrate server cache                             │
│    - Send to client                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Client Component Hydrates                            │
│    - useInfiniteQuery finds cached page 1               │
│    - Renders instantly (no loading state!)               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 5. User Scrolls to 70%                                  │
│    - InfiniteScrollWrapper triggers                     │
│    - fetchNextPage() → fetches page 2                   │
│    - Appends to existing data                           │
└─────────────────────────────────────────────────────────┘
```

### Important Notes

**❌ Common Mistakes**:
```typescript
// DON'T: Different query keys on server and client
// Server: ['transactions', filters]
// Client: ['transactions'] // Missing filters!

// DON'T: Create QueryClient in Providers without useState
// This creates a new client on every render!

// DON'T: Use 'use client' in page.tsx
// Server Components can't prefetch if they're client components
```

**✅ Best Practices**:
- Always match query keys exactly
- Use `cache()` for server query client
- Use `useState` for client query client
- Prefetch only page 1 on server (subsequent pages = client-side)
- Handle loading states for both initial and infinite loads

---

## ✨ Core Features

### 1. Transaction List with Infinite Scroll

**Implementation Approach:**
- Use TanStack Query's `useInfiniteQuery` hook
- Create **reusable `InfiniteScrollWrapper`** component with configurable scroll threshold
- Implement Intersection Observer to detect scroll percentage
- Append new pages to existing data
- Track `hasNextPage` and `isFetchingNextPage` states

**Key Components:**
- `InfiniteScrollWrapper` - **Reusable wrapper** that handles scroll detection
- `TransactionList` - Container that uses the wrapper
- `TransactionCard` - Individual transaction display
- `LoadingSpinner` - Bottom loader
- `EndOfResults` - "No more results" indicator

**InfiniteScrollWrapper Component:**
```typescript
// components/wrappers/InfiniteScrollWrapper.tsx

interface InfiniteScrollWrapperProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // Default: 0.7 (70% scroll)
  loadingIndicator?: React.ReactNode;
  endIndicator?: React.ReactNode;
  className?: string;
}

export const InfiniteScrollWrapper: React.FC<InfiniteScrollWrapperProps> = ({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.7, // Configurable scroll percentage
  loadingIndicator,
  endIndicator,
  className,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <div className={className}>
      {children}

      {/* Trigger element at configurable scroll position */}
      <div ref={observerTarget} className="h-px" aria-hidden="true" />

      {isLoading && (
        loadingIndicator || (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )
      )}

      {!hasMore && !isLoading && (
        endIndicator || (
          <p className="text-center text-gray-500 py-8">
            No more transactions
          </p>
        )
      )}
    </div>
  );
};
```

**Usage in TransactionList:**
```typescript
// components/dashboard/TransactionList.tsx

export const TransactionList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteTransactions();

  return (
    <InfiniteScrollWrapper
      onLoadMore={() => fetchNextPage()}
      hasMore={hasNextPage ?? false}
      isLoading={isFetchingNextPage}
      threshold={0.7} // 70% as per requirements
      className="space-y-4"
    >
      {data?.pages.map((page) =>
        page.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))
      )}
    </InfiniteScrollWrapper>
  );
};
```

**API Response Structure:**

The MockAPI returns an **array of transactions** directly (not a paginated object):
```json
[
  {
    "createdAt": "2026-01-19T03:13:10.103Z",
    "name": "Harold Zemlak",
    "avatar": "https://...",
    "amount": "941.57",
    "currency": "$",
    "category": "withdrawal",
    "status": false,  // boolean: true = success, false = failed
    "id": "1"
  }
]
```

**Status Field Mapping:**
- API returns: `status: boolean`
- Display as: `status === true` → "Success" / `status === false` → "Failed"
- Note: "Pending" status may need to be simulated or derived from other fields

**TypeScript Type:**
```typescript
// lib/types/transaction.ts
export interface Transaction {
  id: string;
  createdAt: string; // ISO date string
  name: string;
  avatar: string;
  amount: string; // Note: API returns string, not number
  currency: string;
  category: 'withdrawal' | 'deposit' | 'transfer';
  status: boolean; // true = success, false = failed
}

export type TransactionStatus = 'success' | 'failed' | 'pending';
```

---

### 2. Filters & Search

**Filter Options:**
- **Status**: Multi-select (Success/Failed)
  - API returns `status: boolean` → Display as Success (true) / Failed (false)
  - **Note**: "Pending" status may need custom logic or omitted if API doesn't support it
  - **Implementation**: Filter client-side after API response (see SSR section)
- **Category**: Single-select dropdown (withdrawal, deposit, transfer)
  - API supports server-side filtering via query params
- **Date Range**: From-To date picker
  - Client-side filtering after fetch (unless API adds support)

**Search:**
- Debounced search input (300ms delay)
- Search by name OR transaction ID
- **Implementation**: API may support `search` query param; otherwise filter client-side
- Clear button to reset search

**State Management:**
```typescript
type FilterState = {
  status: ('success' | 'failed')[]; // Removed 'pending' based on API
  category: 'withdrawal' | 'deposit' | 'transfer' | null;
  dateRange: { from: Date | null; to: Date | null };
  search: string;
};
```

**Filter Strategy:**
- **Server-side**: Category (via API query params)
- **Client-side**: Status, Date Range, Search (after fetching)
- **Why?**: MockAPI may have limited query param support
- **Trade-off**: Client-side filtering means fetching more data, but ensures correct filtering

**Reset Behavior:**
- On filter/search change → reset to page 1
- Clear previous results from cache
- Refetch with new filters
- Show loading skeleton during refetch

---

### 3. Aggregated Insights

**Metrics to Display:**
1. **Total Transactions**: Count of all loaded transactions
2. **Total Successful Amount**: Sum of amounts where `status === true`
3. **Success Rate**: `(successful count / total count) × 100`
4. **Top Category**: Category with highest total amount

**Implementation:**
```typescript
// lib/hooks/useTransactionInsights.ts
import { useMemo } from 'react';
import { Transaction } from '@/lib/types/transaction';

export function useTransactionInsights(transactions: Transaction[]) {
  return useMemo(() => {
    const total = transactions.length;

    const successful = transactions.filter(t => t.status === true);
    const successfulAmount = successful.reduce(
      (sum, t) => sum + parseFloat(t.amount), // API returns string
      0
    );

    const successRate = total > 0 ? (successful.length / total) * 100 : 0;

    // Calculate category totals
    const categoryTotals = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalCount: total,
      successfulAmount,
      successRate,
      topCategory,
    };
  }, [transactions]);
}
```

**Component:**
```typescript
// components/dashboard/InsightsSummary.tsx
import { useTransactionInsights } from '@/lib/hooks/useTransactionInsights';

export function InsightsSummary({ transactions }: { transactions: Transaction[] }) {
  const insights = useTransactionInsights(transactions);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <InsightCard
        label="Total Transactions"
        value={insights.totalCount}
        icon={<ReceiptIcon />}
      />
      <InsightCard
        label="Successful Amount"
        value={`$${insights.successfulAmount.toFixed(2)}`}
        icon={<CheckCircleIcon />}
      />
      <InsightCard
        label="Success Rate"
        value={`${insights.successRate.toFixed(1)}%`}
        icon={<TrendingUpIcon />}
      />
      <InsightCard
        label="Top Category"
        value={insights.topCategory}
        icon={<TagIcon />}
      />
    </section>
  );
}
```

**Key Points:**
- ✅ Use `useMemo` to avoid recalculating on every render
- ✅ Updates automatically as infinite scroll loads more data
- ✅ Handle edge cases (empty arrays, zero division)
- ✅ Parse amount strings to numbers for calculations

---

### 4. Loading States

**States to Handle:**
1. **Initial Load**: Full-page skeleton (8-10 card skeletons)
2. **Infinite Load**: Small spinner at bottom
3. **Refetching**: Subtle top indicator
4. **Empty State**: No results found message
5. **Error State**: Error boundary with retry button

---

## 🏗 Component Architecture

### Semantic HTML Structure
```tsx
<body>
  <Header>
    <nav> {/* Navigation or branding */} </nav>
  </Header>

  <main className="container mx-auto px-4 py-8">
    <section aria-labelledby="insights-heading">
      <h2 id="insights-heading">Transaction Insights</h2>
      <InsightsSummary />
    </section>

    <section aria-labelledby="filters-heading">
      <h2 id="filters-heading" className="sr-only">Filters</h2>
      <FilterPanel />
    </section>

    <section aria-labelledby="transactions-heading">
      <h2 id="transactions-heading">Transactions</h2>
      <TransactionList />
    </section>
  </main>
</body>
```

### Component Composition

**TransactionCard** (Presentational)
- Props: `transaction`, `className`
- Displays all transaction fields
- Status badge with color coding
- Avatar image with fallback
- Semantic HTML: `<article>` with proper headings

**FilterPanel** (Smart Component)
- Manages filter state
- Debounced search
- Emits filter changes to parent
- Mobile: Collapsible drawer
- Desktop: Sidebar or top bar

**InsightsSummary** (Derived Data)
- Receives aggregated data as props
- Grid layout (1 col mobile, 2-4 cols desktop)
- Animated counters (optional polish)

---

## 🔄 State Management Strategy

### Option 1: TanStack Query + URL State (Recommended)
- **Pros**:
  - Shareable URLs
  - Browser back/forward works
  - No global state needed
  - Perfect for server components
- **Implementation**:
  - Use `useSearchParams` for filters
  - TanStack Query for data fetching & caching
  - Derived insights via `useMemo`

### Option 2: Zustand + TanStack Query
- **Pros**:
  - Cleaner filter state management
  - Easy to scale
- **Cons**:
  - Extra dependency
  - URL state still better for filters

### Recommended Approach
```typescript
// URL: /?status=success,pending&category=withdrawal&search=harold

const TransactionDashboard = () => {
  const searchParams = useSearchParams();
  const filters = useMemo(() => ({
    status: searchParams.get('status')?.split(',') ?? [],
    category: searchParams.get('category') ?? null,
    search: searchParams.get('search') ?? '',
  }), [searchParams]);

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: ({ pageParam }) => fetchTransactions({ pageParam, filters }),
    // ...
  });
};
```

---

## ⚡ Performance Optimizations

### 1. Virtualization
- Use `@tanstack/react-virtual` for large lists (100+ items)
- Only render visible transactions + buffer
- Massive performance gain for scrolling

### 2. Memoization
- `useMemo` for insights calculation
- `React.memo` for TransactionCard
- `useCallback` for event handlers

### 3. Image Optimization
- Use Next.js `<Image>` component for avatars
- Lazy loading with blur placeholder
- Proper sizing (48x48 or 64x64)

### 4. Debouncing
- 300ms debounce on search input
- Prevent excessive API calls

### 5. Code Splitting
- Dynamic imports for heavy components (date picker, charts if added)
- Lazy load filter panel on mobile

### 6. Caching Strategy
```typescript
{
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
}
```

---

## 📱 Mobile-First Responsive Design

### Tailwind Breakpoints Strategy
```typescript
// Mobile First: Default styles = mobile
// sm: 640px (large phones)
// md: 768px (tablets)
// lg: 1024px (desktop)
// xl: 1280px (large desktop)
```

### Layout Patterns

**Insights Summary**
```tsx
// Mobile: 1 column stacked
// Tablet: 2 columns
// Desktop: 4 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Transaction Card**
```tsx
// Mobile: Vertical stack, full width
// Desktop: Horizontal layout with flex
<article className="flex flex-col md:flex-row items-start md:items-center gap-4">
  <img className="w-12 h-12 rounded-full" />
  <div className="flex-1 min-w-0"> {/* min-w-0 for text truncation */}
    <h3 className="font-semibold truncate">{name}</h3>
    {/* ... */}
  </div>
</article>
```

**Filter Panel**
```tsx
// Mobile: Fixed bottom sheet or drawer (slide up)
// Desktop: Sticky sidebar or horizontal bar
<aside className="
  fixed md:static bottom-0 inset-x-0
  md:w-64
  bg-white border-t md:border-t-0 md:border-r
  p-4
">
```

**Search Bar**
```tsx
// Mobile: Full width
// Desktop: Max width with icon
<input className="w-full md:max-w-md px-4 py-2 rounded-lg border" />
```

### Touch Targets
- Minimum 44x44px for buttons (WCAG AAA)
- Larger tap areas on mobile
- Proper spacing between interactive elements

### Typography Scale
```css
/* Mobile */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px - body text */
--text-lg: 1.125rem;  /* 18px - headings */

/* Desktop: Scale up by 1-2 steps */
```

### Accessibility
- Semantic HTML (`<main>`, `<nav>`, `<article>`, `<section>`)
- ARIA labels for icon-only buttons
- Focus visible states
- Keyboard navigation support
- Screen reader announcements for loading states

---

## 🎨 Design Tokens (Tailwind Config)

```javascript
// tailwind.config.ts
export default {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Status colors with dark mode variants
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#059669',
        },
        failed: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#dc2626',
        },
        pending: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#d97706',
        },
        // Background colors
        background: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        foreground: {
          light: '#0f172a',
          dark: '#f1f5f9',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
};
```

---

## 🚀 Implementation Phases

### Phase 1: Setup & Core Layout (1-2 hours)
- [ ] Initialize Next.js with TypeScript
- [ ] Install Tailwind CSS (with dark mode config)
- [ ] Set up theme system (next-themes + providers)
- [ ] Create ThemeToggle component
- [ ] Configure PWA (next-pwa, manifest, icons)
- [ ] Set up project structure
- [ ] Create basic layout components (Header, Container)
- [ ] Define TypeScript types
- [ ] Configure dark mode color tokens

### Phase 2: API Integration & Data Fetching (2-3 hours)
- [ ] Install TanStack Query
- [ ] Create TypeScript types for Transaction
- [ ] Create API client (fetchTransactions)
- [ ] Set up server-side query client (getQueryClient)
- [ ] Implement SSR prefetching in page.tsx
- [ ] Set up HydrationBoundary
- [ ] Implement useInfiniteQuery hook on client
- [ ] Test SSR hydration and pagination

### Phase 3: Transaction List & Infinite Scroll (3-4 hours)
- [ ] Build TransactionCard component
- [ ] Implement TransactionList with Intersection Observer
- [ ] Add loading states (skeleton, spinner)
- [ ] Handle empty & error states

### Phase 4: Filters & Search (2-3 hours)
- [ ] Build FilterPanel component
- [ ] Implement multi-select status filter
- [ ] Add category filter
- [ ] Add date range picker
- [ ] Implement debounced search
- [ ] URL state synchronization

### Phase 5: Insights Dashboard (1-2 hours)
- [ ] Calculate derived metrics
- [ ] Build InsightsSummary component
- [ ] Add InsightCard components
- [ ] Responsive grid layout

### Phase 6: Polish & Optimization (2-3 hours)
- [ ] Mobile responsive refinement
- [ ] Add virtualization if needed
- [ ] Performance optimization (memoization)
- [ ] PWA install prompt component
- [ ] Offline indicator
- [ ] Test PWA functionality (offline, install)
- [ ] Accessibility audit
- [ ] Error boundary
- [ ] Loading animations

### Phase 7: Testing & Deployment (1-2 hours)
- [ ] Manual testing across devices
- [ ] README documentation
- [ ] Deploy to Vercel
- [ ] Final QA

**Estimated Total: 12-18 hours**

---

## 🤔 Trade-offs & Decisions

### SSR with TanStack Query Hydration
**Choice**: Hybrid Server + Client Components
- **Pro**: Instant first paint with data (better UX, SEO)
- **Pro**: Zero duplicate requests on initial load
- **Pro**: Client interactivity (infinite scroll, filters)
- **Con**: Slightly more complex setup than pure CSR
- **Result**: Best of both worlds - fast initial load + rich interactivity

**Why This Matters**:
- Traditional CSR: User sees skeleton → waits → sees data (poor UX)
- Our approach: User sees data immediately → can interact instantly
- Perfect for dashboards where initial data is critical

### Reusable InfiniteScrollWrapper Component
**Choice**: Generic wrapper with configurable threshold
- **Pro**: Reusable across app, configurable per use case
- **Pro**: Testable in isolation
- **Pro**: Separation of concerns (scroll logic decoupled from business logic)
- **Pro**: Easy to adjust threshold (70%, 80%, etc.) per requirement
- **Con**: Slightly more abstraction than inline implementation
- **Result**: Cleaner, more maintainable code

### TanStack Query vs SWR
**Choice**: TanStack Query
- More features (infinite queries, mutations, cache management)
- Better TypeScript support
- Industry standard for complex data fetching
- **Trade-off**: Slightly larger bundle size

### Virtualization
**Decision**: Use only if performance issues arise
- **Pro**: Massive performance boost for 1000+ items
- **Con**: Added complexity, potential scroll position bugs
- **Approach**: Implement if list exceeds 500 items

### Filter State: URL vs Global State
**Choice**: URL state
- **Pro**: Shareable links, browser navigation works
- **Con**: Slightly more complex to implement
- Best for dashboards and public-facing apps

### Component Library vs Custom
**Choice**: Headless UI + Custom components
- **Pro**: Full design control, lighter bundle
- **Con**: More time to build
- Perfect middle ground for this use case

### PWA Support
**Choice**: Include PWA functionality
- **Pro**: App-like experience, offline support, installable
- **Pro**: Minimal code changes (mostly config)
- **Pro**: Better mobile UX and performance
- **Pro**: No app store required
- **Con**: Requires icon assets (192x192, 512x512)
- **Con**: Extra ~5KB runtime
- **Result**: Significant UX improvement for minimal effort

**Implementation Time**: ~30 minutes
**Value Add**: ⭐⭐⭐⭐⭐ (High value, low effort)

---

## 📦 Suggested Libraries Summary

| Purpose | Library | Bundle Size | Priority |
|---------|---------|-------------|----------|
| Data Fetching | @tanstack/react-query | ~40KB | ⭐ Required |
| Theme System | next-themes | ~1KB | ⭐ Required |
| Forms | react-hook-form | ~25KB | ⭐ Required |
| Debounce | use-debounce | ~2KB | ⭐ Required |
| Date Utils | date-fns | ~20KB (tree-shaken) | ⭐ Required |
| Icons | lucide-react | ~5KB (tree-shaken) | ⭐ Required |
| PWA | @ducanh2912/next-pwa | ~5KB runtime | ⚡ Recommended |
| Headless UI | @headlessui/react | ~30KB | ⚡ Recommended |
| Virtualization | @tanstack/react-virtual | ~15KB | 🔄 Optional |
| State (if needed) | zustand | ~3KB | 🔄 Optional |

**Total Core Bundle**: ~93KB (before gzip)
**With Recommended**: ~128KB
**With All Optional**: ~146KB

---

## 🎯 Success Criteria

- ✅ Infinite scroll works smoothly (60fps)
- ✅ Filters apply instantly with debounced search
- ✅ Insights update correctly as data loads
- ✅ Mobile responsive (tested on 375px - 1920px)
- ✅ Semantic HTML & accessible
- ✅ No console errors
- ✅ Clean, maintainable code
- ✅ README with architecture explanation
- ✅ Deployed and working live

---

## 📝 Next Steps

1. **Review this plan** - Discuss library choices and architecture
2. **Set up project** - Initialize Next.js with TypeScript
3. **Install dependencies** - Based on agreed libraries
4. **Start with Phase 1** - Build foundational layout
5. **Iterate** - Build feature by feature with testing

Let's discuss any changes or preferences before we begin implementation!
