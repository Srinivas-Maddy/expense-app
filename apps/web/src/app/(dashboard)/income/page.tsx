"use client";

import { useState } from "react";
import { useIncomes, useCreateIncome, useDeleteIncome } from "@/hooks/use-incomes";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function IncomePage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const incomes = useIncomes({ page: String(page), limit: "20" });
  const accounts = useAccounts();
  const createIncome = useCreateIncome();
  const deleteIncome = useDeleteIncome();

  const [form, setForm] = useState({ amount: "", description: "", date: "", source: "", accountId: "" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createIncome.mutate(
      { amount: parseFloat(form.amount), description: form.description, date: form.date, source: form.source, accountId: form.accountId || null },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ amount: "", description: "", date: "", source: "", accountId: "" });
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Income</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {showForm ? "Cancel" : "Add Income"}
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
              <label className="block text-sm font-medium">Date</label>
              <input type="date" required value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <input type="text" required value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Source</label>
              <input type="text" required value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Account (optional)</label>
              <select value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2">
                <option value="">No account</option>
                {accounts.data?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={createIncome.isPending}
            className="rounded-lg bg-success px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            {createIncome.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Source</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {incomes.data?.data.map((inc) => (
              <tr key={inc.id}>
                <td className="px-6 py-4 text-sm">{formatDate(inc.date)}</td>
                <td className="px-6 py-4 text-sm">{inc.description}</td>
                <td className="px-6 py-4 text-sm">{inc.source}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-green-600">+{formatCurrency(inc.amount)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteIncome.mutate(inc.id)}
                    className="text-sm text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!incomes.data?.data.length && (
          <p className="py-12 text-center text-gray-400">No income found</p>
        )}
      </div>

      {incomes.data && incomes.data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50">Previous</button>
          <span className="px-3 py-1 text-sm">Page {page} of {incomes.data.meta.totalPages}</span>
          <button disabled={page >= incomes.data.meta.totalPages} onClick={() => setPage(page + 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
