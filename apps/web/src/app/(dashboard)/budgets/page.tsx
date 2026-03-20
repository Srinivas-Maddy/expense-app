"use client";

import { useState } from "react";
import { useBudgets, useCreateBudget, useDeleteBudget } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";

export default function BudgetsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const budgets = useBudgets(month);
  const categories = useCategories();
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", categoryId: "" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createBudget.mutate(
      { month, amount: parseFloat(form.amount), categoryId: form.categoryId || null },
      { onSuccess: () => { setShowForm(false); setForm({ amount: "", categoryId: "" }); } },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <div className="flex gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border px-3 py-2" />
          <button onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
            {showForm ? "Cancel" : "Set Budget"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border bg-white p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Budget Amount</label>
              <input type="number" step="0.01" min="0.01" required value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Category (optional, blank = overall)</label>
              <select value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2">
                <option value="">Overall Budget</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={createBudget.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
            {createBudget.isPending ? "Saving..." : "Save Budget"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.data?.map((b) => (
          <div key={b.id} className={`rounded-xl border bg-white p-6 ${b.isExceeded ? "border-red-300 bg-red-50" : ""}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{b.category?.name ?? "Overall"}</h3>
              <button onClick={() => deleteBudget.mutate(b.id)}
                className="text-xs text-red-500 hover:underline">Remove</button>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(b.amount)}</p>
            <div className="mt-3">
              <div className="flex justify-between text-sm">
                <span>Spent: {formatCurrency(b.spent)}</span>
                <span>{b.percentUsed}%</span>
              </div>
              <div className="mt-1 h-3 rounded-full bg-gray-200">
                <div
                  className={`h-3 rounded-full transition-all ${
                    b.isExceeded ? "bg-red-500" : b.percentUsed >= 80 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                />
              </div>
              <p className={`mt-1 text-sm ${b.isExceeded ? "text-red-600 font-medium" : "text-gray-500"}`}>
                {b.isExceeded
                  ? `Exceeded by ${formatCurrency(Math.abs(b.remaining))}`
                  : `${formatCurrency(b.remaining)} remaining`}
              </p>
            </div>
          </div>
        ))}
        {budgets.data?.length === 0 && (
          <p className="col-span-full py-12 text-center text-gray-400">No budgets set for this month</p>
        )}
      </div>
    </div>
  );
}
