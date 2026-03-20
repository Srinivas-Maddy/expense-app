"use client";

import { useState } from "react";
import { useMonthComparison } from "@/hooks/use-dashboard";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import { Skeleton } from "@/components/loading-skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";

export default function ComparisonPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const comparison = useMonthComparison(month);
  const data = comparison.data;

  if (comparison.isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-white p-6"><Skeleton className="h-4 w-20 mb-3" /><Skeleton className="h-8 w-32" /></div>
          ))}
        </div>
        <div className="rounded-2xl border bg-white p-6"><Skeleton className="h-5 w-48 mb-4" /><Skeleton className="h-64 w-full" /></div>
      </div>
    );
  }

  if (!data) return null;

  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-");
    return new Date(Number(y), Number(mo) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const summaryBarData = [
    { name: "Income", current: data.current.totalIncome, previous: data.previous.totalIncome },
    { name: "Expenses", current: data.current.totalExpenses, previous: data.previous.totalExpenses },
    { name: "Balance", current: data.current.balance, previous: data.previous.balance },
  ];

  const categoryBarData = data.categoryComparison.slice(0, 8).map((c) => ({
    name: c.categoryName,
    current: c.currentTotal,
    previous: c.previousTotal,
    color: c.color,
  }));

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Month Comparison</h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-indigo-600">{monthLabel(data.currentMonth)}</span>
            {" vs "}
            <span className="font-medium text-gray-600">{monthLabel(data.previousMonth)}</span>
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Summary Change Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ChangeCard
          title="Income"
          current={data.current.totalIncome}
          previous={data.previous.totalIncome}
          changePercent={data.incomeChange}
          positiveIsGood={true}
        />
        <ChangeCard
          title="Expenses"
          current={data.current.totalExpenses}
          previous={data.previous.totalExpenses}
          changePercent={data.expenseChange}
          positiveIsGood={false}
        />
        <ChangeCard
          title="Balance"
          current={data.current.balance}
          previous={data.previous.balance}
          changePercent={data.previous.balance !== 0 ? Math.round(((data.current.balance - data.previous.balance) / Math.abs(data.previous.balance)) * 100) : 0}
          positiveIsGood={true}
        />
      </div>

      {/* Summary Bar Chart */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-gray-900">Overview Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryBarData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
            <Legend />
            <Bar dataKey="current" name={monthLabel(data.currentMonth)} fill="#6366f1" radius={[6, 6, 0, 0]} />
            <Bar dataKey="previous" name={monthLabel(data.previousMonth)} fill="#c7d2fe" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Comparison Chart */}
      {categoryBarData.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryBarData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} width={100} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Legend />
              <Bar dataKey="current" name="This Month" fill="#6366f1" radius={[0, 6, 6, 0]} />
              <Bar dataKey="previous" name="Last Month" fill="#c7d2fe" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Changes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Biggest Increases */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
              <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900">Spending Increased</h2>
          </div>
          {data.topIncreases.length > 0 ? (
            <div className="space-y-3">
              {data.topIncreases.map((c) => (
                <div key={c.categoryId} className="flex items-center justify-between rounded-xl bg-red-50/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color || "#ef4444" }} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.categoryName}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(c.previousTotal)} → {formatCurrency(c.currentTotal)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-500">+{formatCurrency(c.change)}</p>
                    <p className="text-xs text-red-400">+{c.changePercent}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">No spending increases</p>
          )}
        </div>

        {/* Biggest Decreases */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900">Spending Decreased</h2>
          </div>
          {data.topDecreases.length > 0 ? (
            <div className="space-y-3">
              {data.topDecreases.map((c) => (
                <div key={c.categoryId} className="flex items-center justify-between rounded-xl bg-green-50/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color || "#22c55e" }} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.categoryName}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(c.previousTotal)} → {formatCurrency(c.currentTotal)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{formatCurrency(c.change)}</p>
                    <p className="text-xs text-green-500">{c.changePercent}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">No spending decreases</p>
          )}
        </div>
      </div>

      {/* Full Category Table */}
      {data.categoryComparison.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">All Categories</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{monthLabel(data.previousMonth)}</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{monthLabel(data.currentMonth)}</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.categoryComparison.map((c) => {
                const isUp = c.change > 0;
                const isDown = c.change < 0;
                return (
                  <tr key={c.categoryId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color || "#6366f1" }} />
                        <span className="text-sm font-medium text-gray-900">{c.categoryName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm text-gray-500">{formatCurrency(c.previousTotal)}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-medium text-gray-900">{formatCurrency(c.currentTotal)}</td>
                    <td className={`px-6 py-3.5 text-right text-sm font-semibold ${isUp ? "text-red-500" : isDown ? "text-green-600" : "text-gray-400"}`}>
                      {isUp ? "+" : ""}{formatCurrency(c.change)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {c.change !== 0 ? (
                        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isUp ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                        }`}>
                          {isUp ? "↑" : "↓"} {Math.abs(c.changePercent)}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Change Card Component ── */

function ChangeCard({
  title, current, previous, changePercent, positiveIsGood,
}: {
  title: string; current: number; previous: number; changePercent: number; positiveIsGood: boolean;
}) {
  const isUp = changePercent > 0;
  const isGood = positiveIsGood ? isUp : !isUp;
  const isNeutral = changePercent === 0;

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(current)}</p>
      <div className="mt-2 flex items-center gap-2">
        {!isNeutral && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            isGood ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}>
            {isUp ? "↑" : "↓"} {Math.abs(changePercent)}%
          </span>
        )}
        <span className="text-xs text-gray-400">
          vs {formatCurrency(previous)}
        </span>
      </div>
    </div>
  );
}
