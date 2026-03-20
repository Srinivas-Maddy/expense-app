"use client";

import { useState } from "react";
import { useAccounts, useCreateAccount, useDeleteAccount } from "@/hooks/use-accounts";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";
import { SUPPORTED_CURRENCIES } from "@expense-app/shared";

const typeLabels: Record<string, string> = {
  cash: "Cash",
  bank: "Bank Account",
  wallet: "Digital Wallet",
  credit_card: "Credit Card",
};

const typeColors: Record<string, string> = {
  cash: "bg-green-100 text-green-700",
  bank: "bg-blue-100 text-blue-700",
  wallet: "bg-purple-100 text-purple-700",
  credit_card: "bg-orange-100 text-orange-700",
};

export default function AccountsPage() {
  const accounts = useAccounts();
  const { user } = useAuth();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const [showForm, setShowForm] = useState(false);
  const defaultCurrency = user?.currency || "INR";
  const [form, setForm] = useState({ name: "", type: "bank" as const, balance: "", currency: defaultCurrency });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createAccount.mutate(
      { name: form.name, type: form.type, balance: parseFloat(form.balance || "0"), currency: form.currency },
      { onSuccess: () => { setShowForm(false); setForm({ name: "", type: "bank", balance: "", currency: defaultCurrency }); } },
    );
  }

  const totalBalance = accounts.data?.reduce((sum, a) => sum + a.balance, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-gray-500">Total Balance: <span className="font-semibold text-indigo-600">{formatCurrency(totalBalance)}</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          {showForm ? "Cancel" : "Add Account"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border bg-white p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium">Account Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Type</label>
              <select value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="mt-1 w-full rounded-lg border px-3 py-2">
                <option value="cash">Cash</option>
                <option value="bank">Bank Account</option>
                <option value="wallet">Digital Wallet</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Initial Balance</label>
              <input type="number" step="0.01" value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Currency</label>
              <select value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2">
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={createAccount.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
            {createAccount.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.data?.map((acc) => (
          <div key={acc.id} className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{acc.name}</h3>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${typeColors[acc.type]}`}>
                  {typeLabels[acc.type]}
                </span>
              </div>
              <button onClick={() => deleteAccount.mutate(acc.id)}
                className="text-xs text-red-500 hover:underline">Delete</button>
            </div>
            <p className={`mt-3 text-2xl font-bold ${acc.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
              {formatCurrency(acc.balance)}
            </p>
            <p className="mt-1 text-xs text-gray-400">{acc.currency}</p>
          </div>
        ))}
        {accounts.data?.length === 0 && (
          <p className="col-span-full py-12 text-center text-gray-400">No accounts yet</p>
        )}
      </div>
    </div>
  );
}
