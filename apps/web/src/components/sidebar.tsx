"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useUnreadCount } from "@/hooks/use-notifications";
import { SUPPORTED_CURRENCIES } from "@expense-app/shared";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/income", label: "Income" },
  { href: "/categories", label: "Categories" },
  { href: "/budgets", label: "Budgets" },
  { href: "/trends", label: "Trends" },
  { href: "/comparison", label: "Comparison" },
  { href: "/money-leaks", label: "Money Leaks" },
  { href: "/recurring", label: "Recurring" },
  { href: "/accounts", label: "Accounts" },
  { href: "/export", label: "Export" },
  { href: "/notifications", label: "Notifications", badge: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, updateCurrency } = useAuth();
  const unreadCount = useUnreadCount();

  const currentSymbol = SUPPORTED_CURRENCIES.find((c) => c.code === user?.currency)?.symbol ?? "$";

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-bold text-primary">Expense Manager</h1>
      </div>
      <nav className="flex-1 space-y-1 overflow-auto px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            {item.label}
            {item.badge && unreadCount.data?.count ? (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs text-white">
                {unreadCount.data.count}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="border-t px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentSymbol}</span>
          <select
            value={user?.currency || "INR"}
            onChange={(e) => updateCurrency(e.target.value)}
            className="flex-1 rounded border px-2 py-1 text-xs"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
        <p className="truncate text-sm font-medium">{user?.name || user?.email}</p>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">
          Sign out
        </button>
      </div>
    </aside>
  );
}
