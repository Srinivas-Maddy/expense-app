"use client";

import { useState } from "react";
import { getAccessToken } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ExportPage() {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    format: "excel" as "excel" | "pdf",
    type: "all" as "expenses" | "income" | "all",
  });
  const [loading, setLoading] = useState(false);

  async function handleExport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams({
        format: form.format,
        startDate: form.startDate,
        endDate: form.endDate,
        type: form.type,
      });

      const res = await fetch(`${API_URL}/export?${params}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const ext = form.format === "excel" ? "csv" : "html";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${form.startDate}_${form.endDate}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Export Data</h1>

      <form onSubmit={handleExport} className="max-w-lg rounded-xl border bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input type="date" required value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input type="date" required value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Data Type</label>
          <select value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
            className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="all">All Transactions</option>
            <option value="expenses">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Format</label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="format" value="excel"
                checked={form.format === "excel"}
                onChange={() => setForm({ ...form, format: "excel" })} />
              <span className="text-sm">Excel (CSV)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="format" value="pdf"
                checked={form.format === "pdf"}
                onChange={() => setForm({ ...form, format: "pdf" })} />
              <span className="text-sm">PDF (HTML Report)</span>
            </label>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-50">
          {loading ? "Generating..." : "Download Report"}
        </button>
      </form>
    </div>
  );
}
