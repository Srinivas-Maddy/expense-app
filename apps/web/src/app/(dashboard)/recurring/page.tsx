"use client";

import { useState } from "react";
import {
  useRecurringExpenses, useCreateRecurringExpense,
  useDeleteRecurringExpense, useToggleRecurringExpense,
} from "@/hooks/use-recurring";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function RecurringPage() {
  const items = useRecurringExpenses();
  const categories = useCategories();
  const createItem = useCreateRecurringExpense();
  const deleteItem = useDeleteRecurringExpense();
  const toggleItem = useToggleRecurringExpense();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: "", description: "", categoryId: "", frequency: "monthly" as const, startDate: "",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createItem.mutate(
      {
        amount: parseFloat(form.amount),
        description: form.description,
        categoryId: form.categoryId,
        frequency: form.frequency,
        startDate: form.startDate,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ amount: "", description: "", categoryId: "", frequency: "monthly", startDate: "" });
        },
      },
    );
  }

  const freqLabels: Record<string, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring Expenses</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          {showForm ? "Cancel" : "Add Recurring"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border bg-white p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Amount</label>
              <input type="number" step="0.01" min="0.01" required value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <input type="text" required value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select required value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2">
                <option value="">Select category</option>
                {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Frequency</label>
              <select value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                className="mt-1 w-full rounded-lg border px-3 py-2">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input type="date" required value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
          </div>
          <button type="submit" disabled={createItem.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
            {createItem.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Frequency</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Next Run</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.data?.map((r) => (
              <tr key={r.id} className={!r.isActive ? "opacity-50" : ""}>
                <td className="px-6 py-4 text-sm">{r.description}</td>
                <td className="px-6 py-4 text-sm">{freqLabels[r.frequency]}</td>
                <td className="px-6 py-4 text-sm">{formatDate(r.nextRunDate)}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-red-500">
                  {formatCurrency(r.amount)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {r.isActive ? "Active" : "Paused"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => toggleItem.mutate(r.id)}
                    className="text-sm text-indigo-500 hover:underline">
                    {r.isActive ? "Pause" : "Resume"}
                  </button>
                  <button onClick={() => deleteItem.mutate(r.id)}
                    className="text-sm text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.data?.length && (
          <p className="py-12 text-center text-gray-400">No recurring expenses</p>
        )}
      </div>
    </div>
  );
}
