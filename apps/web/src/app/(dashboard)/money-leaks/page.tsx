"use client";

import { useMoneyLeaks } from "@/hooks/use-smart";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/loading-skeleton";

const severityConfig = {
  high: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700", icon: "🔴", label: "High" },
  medium: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "🟡", label: "Medium" },
  low: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "🔵", label: "Low" },
};

const typeConfig = {
  subscription: { icon: "🔄", label: "Subscription", color: "text-purple-600", bg: "bg-purple-100" },
  repeat_spend: { icon: "🔁", label: "Repeat Spending", color: "text-orange-600", bg: "bg-orange-100" },
  impulse: { icon: "⚡", label: "Impulse Purchases", color: "text-pink-600", bg: "bg-pink-100" },
  rounding: { icon: "🪙", label: "Rounding Up", color: "text-teal-600", bg: "bg-teal-100" },
};

export default function MoneyLeaksPage() {
  const leaks = useMoneyLeaks();

  if (leaks.isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="rounded-2xl border bg-white p-6"><Skeleton className="h-4 w-20 mb-3" /><Skeleton className="h-8 w-32" /></div>)}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const data = leaks.data;
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Money Leaks</h1>
        <p className="mt-1 text-sm text-gray-500">Subscriptions, repeat charges, and patterns draining your wallet</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Leaks Found</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data.totalLeaks}</p>
          <p className="mt-1 text-xs text-gray-400">patterns detected</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
          <p className="text-sm font-medium text-red-500">Monthly Drain</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{formatCurrency(data.totalMonthly)}</p>
          <p className="mt-1 text-xs text-red-400">leaving your account monthly</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
          <p className="text-sm font-medium text-red-500">Annual Impact</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{formatCurrency(data.totalAnnual)}</p>
          <p className="mt-1 text-xs text-red-400">projected yearly cost</p>
        </div>
      </div>

      {data.leaks.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <span className="mb-4 text-5xl">🎉</span>
          <h3 className="text-lg font-semibold text-gray-900">No money leaks detected!</h3>
          <p className="mt-1 text-sm text-gray-500">Your spending looks healthy. Keep it up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.leaks.map((leak, i) => {
            const sev = severityConfig[leak.severity];
            const typ = typeConfig[leak.type] ?? typeConfig.subscription;
            return (
              <div key={i} className={`rounded-2xl border ${sev.border} ${sev.bg} p-5 shadow-sm transition-all hover:shadow-md`}>
                {/* Leak Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${typ.bg} text-lg`}>
                      {typ.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">{leak.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sev.badge}`}>
                          {sev.icon} {sev.label}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typ.bg} ${typ.color}`}>
                          {typ.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600">{leak.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-red-600">{formatCurrency(leak.amount)}<span className="text-xs font-normal text-red-400">/mo</span></p>
                    <p className="text-xs text-gray-500">{formatCurrency(leak.annualCost)}/year</p>
                  </div>
                </div>

                {/* Frequency badge */}
                <div className="mt-3 flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {leak.frequency}
                  </span>
                </div>

                {/* Recent transactions */}
                {leak.transactions.length > 0 && (
                  <div className="mt-3 rounded-xl bg-white/60 p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Recent Charges</p>
                    <div className="space-y-1.5">
                      {leak.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-gray-400 shrink-0">{formatDate(tx.date)}</span>
                            <span className="text-gray-700 truncate">{tx.description}</span>
                          </div>
                          <span className="text-sm font-medium text-red-500 shrink-0 ml-3">{formatCurrency(tx.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-indigo-900">💡 Tips to Plug Your Leaks</h3>
        <ul className="mt-3 space-y-2 text-sm text-indigo-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            Review subscriptions quarterly — cancel anything you haven&apos;t used in 30 days
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            Set a daily spending cap for frequent small purchases
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            Use the 24-hour rule: wait a day before any unplanned purchase over {formatCurrency(500)}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            Switch annual billing where possible — most subscriptions offer 15-20% savings
          </li>
        </ul>
      </div>
    </div>
  );
}
