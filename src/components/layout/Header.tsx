import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
          Transaction Insights
        </h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
