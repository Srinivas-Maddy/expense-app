"use client";

import { useState, useEffect, useRef } from "react";
import { useExpenses, useCreateExpense, useDeleteExpense } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { useTags } from "@/hooks/use-tags";
import { useSuggestCategory } from "@/hooks/use-smart";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search: "", categoryId: "", tagId: "", startDate: "", endDate: "" });

  const queryParams: Record<string, string> = { page: String(page), limit: "20" };
  if (filters.search) queryParams.search = filters.search;
  if (filters.categoryId) queryParams.categoryId = filters.categoryId;
  if (filters.tagId) queryParams.tagId = filters.tagId;
  if (filters.startDate) queryParams.startDate = filters.startDate;
  if (filters.endDate) queryParams.endDate = filters.endDate;

  const expenses = useExpenses(queryParams);
  const categories = useCategories();
  const accounts = useAccounts();
  const tags = useTags();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const suggestCategory = useSuggestCategory();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [form, setForm] = useState({
    amount: "", description: "", date: "", categoryId: "", accountId: "", tagInput: "", selectedTagIds: [] as string[],
  });

  // Auto-suggest category when description changes
  function handleDescriptionChange(desc: string) {
    setForm((f) => ({ ...f, description: desc }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (desc.length >= 3 && !form.categoryId) {
      debounceRef.current = setTimeout(() => {
        suggestCategory.mutate(desc);
      }, 500);
    }
  }

  // Apply suggestion
  function applySuggestion(categoryId: string) {
    setForm((f) => ({ ...f, categoryId }));
  }

  function addTag(tagId: string) {
    if (!form.selectedTagIds.includes(tagId)) {
      setForm({ ...form, selectedTagIds: [...form.selectedTagIds, tagId] });
    }
  }

  function removeTag(tagId: string) {
    setForm({ ...form, selectedTagIds: form.selectedTagIds.filter((id) => id !== tagId) });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const newTags = form.tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    createExpense.mutate(
      {
        amount: parseFloat(form.amount),
        description: form.description,
        date: form.date,
        categoryId: form.categoryId,
        accountId: form.accountId || null,
        tagIds: form.selectedTagIds.length > 0 ? form.selectedTagIds : undefined,
        newTags: newTags.length > 0 ? newTags : undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ amount: "", description: "", date: "", categoryId: "", accountId: "", tagInput: "", selectedTagIds: [] });
        },
      },
    );
  }

  const activeFilterCount = [filters.search, filters.categoryId, filters.tagId, filters.startDate].filter(Boolean).length;

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500">{expenses.data?.meta.total ?? 0} transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              activeFilterCount > 0 ? "border-indigo-200 bg-indigo-50 text-indigo-600" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">{activeFilterCount}</span>
            )}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
          >
            {showForm ? "Cancel" : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm slide-up">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search description, category, tags..."
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <select
              value={filters.categoryId}
              onChange={(e) => { setFilters({ ...filters, categoryId: e.target.value }); setPage(1); }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All categories</option>
              {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={filters.tagId}
              onChange={(e) => { setFilters({ ...filters, tagId: e.target.value }); setPage(1); }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All tags</option>
              {tags.data?.map((t) => <option key={t.id} value={t.id}>#{t.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="date" value={filters.startDate} onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-sm" placeholder="From" />
              <input type="date" value={filters.endDate} onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-sm" placeholder="To" />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setFilters({ search: "", categoryId: "", tagId: "", startDate: "", endDate: "" }); setPage(1); }}
              className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm slide-up">
          <h3 className="mb-4 font-semibold text-gray-900">New Expense</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Amount</label>
              <input type="number" step="0.01" min="0.01" required value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Date</label>
              <input type="date" required value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Description</label>
              <input type="text" required value={form.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="e.g. Starbucks coffee, Uber ride..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              {/* Auto-category suggestions */}
              {suggestCategory.data && suggestCategory.data.length > 0 && !form.categoryId && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-medium text-gray-400 self-center mr-1">AI suggests:</span>
                  {suggestCategory.data.map((s) => (
                    <button key={s.categoryId} type="button" onClick={() => applySuggestion(s.categoryId)}
                      className="group flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-100 hover:shadow-sm border border-indigo-100">
                      <span className="text-indigo-400">✦</span> {s.categoryName}
                      <span className="text-[9px] text-indigo-400">{s.confidence}%</span>
                    </button>
                  ))}
                </div>
              )}
              {suggestCategory.isPending && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                  Analyzing...
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Category</label>
              <select required value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="">Select</option>
                {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Account (optional)</label>
              <select value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="">None</option>
                {accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Tags</label>
              {/* Existing tag selection */}
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.data?.map((t) => (
                  <button key={t.id} type="button" onClick={() => form.selectedTagIds.includes(t.id) ? removeTag(t.id) : addTag(t.id)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      form.selectedTagIds.includes(t.id)
                        ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}>
                    #{t.name}
                  </button>
                ))}
              </div>
              {/* New tags input */}
              <input type="text" placeholder="New tags (comma separated)"
                value={form.tagInput}
                onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>
          <button type="submit" disabled={createExpense.isPending}
            className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50">
            {createExpense.isPending ? "Saving..." : "Save Expense"}
          </button>
        </form>
      )}

      {/* Expenses Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {expenses.data?.data.map((exp) => (
              <tr key={exp.id} className="transition-colors hover:bg-gray-50/50">
                <td className="px-5 py-4 text-sm text-gray-600">{formatDate(exp.date)}</td>
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{exp.description}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: (exp.category.color || "#6366f1") + "15", color: exp.category.color || "#6366f1" }}>
                    {exp.category.name}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {exp.tags?.map((t) => (
                      <span key={t.id} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                        #{t.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-red-500">-{formatCurrency(exp.amount)}</td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => deleteExpense.mutate(exp.id)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!expenses.data?.data.length && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="mb-3 text-4xl">💸</span>
            <p className="text-sm font-medium text-gray-400">
              {activeFilterCount > 0 ? "No expenses match your filters" : "No expenses yet. Start tracking!"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {expenses.data && expenses.data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40">
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            Page <span className="font-semibold text-gray-900">{page}</span> of {expenses.data.meta.totalPages}
          </span>
          <button disabled={page >= expenses.data.meta.totalPages} onClick={() => setPage(page + 1)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
