"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboardSummary, useCategoryBreakdown } from "@/hooks/use-dashboard";
import { useExpenses } from "@/hooks/use-expenses";
import { useBudgets } from "@/hooks/use-budgets";
import { useMonthlyTrends } from "@/hooks/use-trends";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from "recharts";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(getCurrentMonth());
  const summary = useDashboardSummary(month);
  const breakdown = useCategoryBreakdown(month);
  const recentExpenses = useExpenses({ limit: "5" });
  const budgets = useBudgets(month);
  const trends = useMonthlyTrends(6);

  const isLoading = summary.isLoading || breakdown.isLoading;

  if (isLoading) return <DashboardSkeleton />;

  const exceededBudgets = budgets.data?.filter((b) => b.isExceeded) ?? [];
  const warningBudgets = budgets.data?.filter((b) => !b.isExceeded && b.percentUsed >= 80) ?? [];
  const totalAlerts = exceededBudgets.length + warningBudgets.length;

  const income = summary.data?.totalIncome ?? 0;
  const expenses = summary.data?.totalExpenses ?? 0;
  const balance = summary.data?.balance ?? 0;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s your financial overview</p>
        </div>
        <div className="flex items-center gap-3">
          {totalAlerts > 0 && (
            <Link
              href="/budgets"
              className="flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {totalAlerts} budget alert{totalAlerts > 1 ? "s" : ""}
            </Link>
          )}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Income"
          amount={income}
          icon={<ArrowUpIcon />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          amountColor="text-emerald-600"
        />
        <SummaryCard
          title="Total Expenses"
          amount={expenses}
          icon={<ArrowDownIcon />}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          amountColor="text-red-500"
        />
        <SummaryCard
          title="Balance"
          amount={balance}
          icon={<WalletIcon />}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          amountColor={balance >= 0 ? "text-indigo-600" : "text-red-500"}
        />
        <SummaryCard
          title="Savings Rate"
          amount={savingsRate}
          isCurrency={false}
          suffix="%"
          icon={<ChartIcon />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          amountColor={savingsRate >= 0 ? "text-purple-600" : "text-red-500"}
        />
      </div>

      {/* Budget Alerts */}
      {totalAlerts > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exceededBudgets.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-700 truncate">{b.category?.name ?? "Overall"} exceeded</p>
                <p className="text-xs text-red-500">{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</p>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">{b.percentUsed}%</span>
            </div>
          ))}
          {warningBudgets.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-700 truncate">{b.category?.name ?? "Overall"} warning</p>
                <p className="text-xs text-amber-500">{formatCurrency(b.remaining)} left</p>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-600">{b.percentUsed}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Breakdown - Donut Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Spending by Category</h2>
            <Link href="/expenses" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
              View all →
            </Link>
          </div>
          {breakdown.data && breakdown.data.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={breakdown.data}
                      dataKey="total"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {breakdown.data.map((entry, i) => (
                        <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2.5">
                {breakdown.data.slice(0, 5).map((item, i) => (
                  <div key={item.categoryId} className="flex items-center gap-2.5">
                    <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color || CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="flex-1 truncate text-sm text-gray-600">{item.categoryName}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon="📊" message="No expenses this month" />
          )}
        </div>

        {/* Trend Chart - Area Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Monthly Trends</h2>
            <Link href="/trends" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
              View all →
            </Link>
          </div>
          {trends.data && trends.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trends.data}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                />
                <Area type="monotone" dataKey="totalIncome" name="Income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="totalExpenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="📈" message="No trend data yet" />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
            <Link href="/expenses" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
              View all →
            </Link>
          </div>
          {recentExpenses.data?.data.length ? (
            <div className="space-y-1">
              {recentExpenses.data.data.map((exp, i) => (
                <div
                  key={exp.id}
                  className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm"
                    style={{
                      backgroundColor: (exp.category.color || "#6366f1") + "15",
                      color: exp.category.color || "#6366f1",
                    }}
                  >
                    {exp.category.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{exp.description}</p>
                    <p className="text-xs text-gray-400">{exp.category.name} · {formatDate(exp.date)}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500">-{formatCurrency(exp.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="💸" message="No expenses yet. Start tracking!" />
          )}
        </div>

        {/* Quick Actions + Budget Overview */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction href="/expenses" label="Add Expense" icon="💰" gradient="from-red-500 to-pink-500" />
              <QuickAction href="/income" label="Add Income" icon="💵" gradient="from-emerald-500 to-teal-500" />
              <QuickAction href="/budgets" label="Set Budget" icon="🎯" gradient="from-indigo-500 to-purple-500" />
              <QuickAction href="/export" label="Export" icon="📤" gradient="from-amber-500 to-orange-500" />
            </div>
          </div>

          {/* Top Budget Progress */}
          {budgets.data && budgets.data.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Budget Status</h2>
                <Link href="/budgets" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
                  Manage →
                </Link>
              </div>
              <div className="space-y-4">
                {budgets.data.slice(0, 3).map((b) => {
                  const pct = Math.min(b.percentUsed, 100);
                  const color = b.isExceeded ? "#ef4444" : b.percentUsed >= 80 ? "#f59e0b" : "#22c55e";
                  return (
                    <div key={b.id}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{b.category?.name ?? "Overall"}</span>
                        <span className="text-xs text-gray-400">{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SummaryCard({
  title, amount, icon, iconBg, iconColor, amountColor, isCurrency = true, suffix = "",
}: {
  title: string; amount: number; icon: React.ReactNode; iconBg: string; iconColor: string; amountColor: string; isCurrency?: boolean; suffix?: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${amountColor}`}>
        {isCurrency ? formatCurrency(amount) : `${amount}${suffix}`}
      </p>
    </div>
  );
}

function QuickAction({ href, label, icon, gradient }: { href: string; label: string; icon: string; gradient: string }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1.5 rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="mb-3 text-4xl">{icon}</span>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

/* ── Icons ── */

function ArrowUpIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.008A2.25 2.25 0 0121 6v6zm0 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
