"use client";

import { useState } from "react";
import { useMonthlyTrends } from "@/hooks/use-trends";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

export default function TrendsPage() {
  const [months, setMonths] = useState(6);
  const trends = useMonthlyTrends(months);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Trends</h1>
        <select value={months} onChange={(e) => setMonths(Number(e.target.value))}
          className="rounded-lg border px-3 py-2">
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>
      </div>

      {trends.data && trends.data.length > 0 ? (
        <>
          {/* Bar Chart: Income vs Expenses */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={trends.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="totalIncome" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalExpenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart: Balance over time */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Balance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="balance" name="Balance" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="rounded-xl border bg-white">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Month</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Income</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Expenses</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {trends.data.map((t) => (
                  <tr key={t.month}>
                    <td className="px-6 py-4 text-sm font-medium">{t.month}</td>
                    <td className="px-6 py-4 text-right text-sm text-green-600">{formatCurrency(t.totalIncome)}</td>
                    <td className="px-6 py-4 text-right text-sm text-red-500">{formatCurrency(t.totalExpenses)}</td>
                    <td className={`px-6 py-4 text-right text-sm font-medium ${t.balance >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                      {formatCurrency(t.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="py-12 text-center text-gray-400">No data available</p>
      )}
    </div>
  );
}
