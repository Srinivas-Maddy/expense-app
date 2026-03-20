"use client";

import { useState } from "react";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/use-categories";

export default function CategoriesPage() {
  const categories = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#6366f1" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createCategory.mutate(
      { name: form.name, color: form.color },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ name: "", color: "#6366f1" });
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border bg-white p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Color</label>
              <input type="color" value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="mt-1 h-10 w-16 rounded-lg border" />
            </div>
          </div>
          <button type="submit" disabled={createCategory.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
            {createCategory.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categories.data?.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color || "#ccc" }} />
              <span className="font-medium">{cat.name}</span>
              {cat.isDefault && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Default</span>
              )}
            </div>
            {!cat.isDefault && (
              <button onClick={() => deleteCategory.mutate(cat.id)}
                className="text-sm text-red-500 hover:underline">Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
