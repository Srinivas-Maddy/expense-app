import { prisma } from "@expense-app/db";
import type { ExportQuery } from "@expense-app/shared";

interface ExportRow {
  date: string;
  type: "expense" | "income";
  description: string;
  category?: string;
  source?: string;
  account?: string;
  amount: number;
}

export async function generateExportData(userId: string, query: ExportQuery): Promise<ExportRow[]> {
  const start = new Date(query.startDate);
  const end = new Date(query.endDate);
  const rows: ExportRow[] = [];

  if (query.type === "expenses" || query.type === "all") {
    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });
    for (const e of expenses) {
      rows.push({
        date: e.date.toISOString().split("T")[0],
        type: "expense",
        description: e.description,
        category: e.category.name,
        account: e.account?.name ?? "",
        amount: -Number(e.amount),
      });
    }
  }

  if (query.type === "income" || query.type === "all") {
    const incomes = await prisma.income.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { account: { select: { name: true } } },
      orderBy: { date: "asc" },
    });
    for (const i of incomes) {
      rows.push({
        date: i.date.toISOString().split("T")[0],
        type: "income",
        description: i.description,
        source: i.source,
        account: i.account?.name ?? "",
        amount: Number(i.amount),
      });
    }
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

export function toCsv(rows: ExportRow[]): string {
  const headers = ["Date", "Type", "Description", "Category", "Source", "Account", "Amount"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.date,
        r.type,
        `"${r.description.replace(/"/g, '""')}"`,
        r.category ?? "",
        r.source ?? "",
        r.account ?? "",
        r.amount.toFixed(2),
      ].join(","),
    ),
  ];
  return lines.join("\n");
}

export function toHtml(rows: ExportRow[], startDate: string, endDate: string, currency = "INR"): string {
  const tableRows = rows
    .map(
      (r) =>
        `<tr>
      <td>${r.date}</td>
      <td>${r.type}</td>
      <td>${r.description}</td>
      <td>${r.category ?? ""}</td>
      <td>${r.source ?? ""}</td>
      <td>${r.account ?? ""}</td>
      <td style="text-align:right;color:${r.amount < 0 ? "red" : "green"}">${r.amount.toFixed(2)}</td>
    </tr>`,
    )
    .join("\n");

  const totalIncome = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const totalExpenses = rows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Financial Report</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  .summary { margin: 20px 0; }
  .summary span { margin-right: 30px; font-weight: bold; }
</style></head><body>
<h1>Financial Report</h1>
<p>${startDate} to ${endDate}</p>
<div class="summary">
  <span style="color:green">Income: ${new Intl.NumberFormat("en", { style: "currency", currency }).format(totalIncome)}</span>
  <span style="color:red">Expenses: ${new Intl.NumberFormat("en", { style: "currency", currency }).format(totalExpenses)}</span>
  <span>Balance: ${new Intl.NumberFormat("en", { style: "currency", currency }).format(totalIncome - totalExpenses)}</span>
</div>
<table>
  <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Source</th><th>Account</th><th>Amount</th></tr></thead>
  <tbody>${tableRows}</tbody>
</table>
</body></html>`;
}
