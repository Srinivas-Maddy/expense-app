import { prisma } from "@expense-app/db";

interface SearchResult {
  type: "expense" | "income";
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  source?: string;
  tags: { id: string; name: string; color: string | null }[];
}

export async function globalSearch(
  userId: string,
  q: string,
  type: "all" | "expenses" | "income",
  limit: number,
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const searchTerm = `%${q}%`;

  if (type === "all" || type === "expenses") {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        OR: [
          { description: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
          { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
        ],
      },
      include: {
        category: { select: { name: true } },
        tags: true,
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    for (const e of expenses) {
      results.push({
        type: "expense",
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        date: e.date.toISOString(),
        category: e.category.name,
        tags: e.tags.map((t) => ({ id: t.id, name: t.name, color: t.color })),
      });
    }
  }

  if (type === "all" || type === "income") {
    const incomes = await prisma.income.findMany({
      where: {
        userId,
        OR: [
          { description: { contains: q, mode: "insensitive" } },
          { source: { contains: q, mode: "insensitive" } },
          { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
        ],
      },
      include: { tags: true },
      orderBy: { date: "desc" },
      take: limit,
    });

    for (const i of incomes) {
      results.push({
        type: "income",
        id: i.id,
        description: i.description,
        amount: Number(i.amount),
        date: i.date.toISOString(),
        source: i.source,
        tags: i.tags.map((t) => ({ id: t.id, name: t.name, color: t.color })),
      });
    }
  }

  // Sort by date desc, limit total
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return results.slice(0, limit);
}
