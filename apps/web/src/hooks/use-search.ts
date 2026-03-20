"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SearchResult } from "@expense-app/shared";

export function useGlobalSearch(query: string, type: "all" | "expenses" | "income" = "all") {
  return useQuery({
    queryKey: ["search", query, type],
    queryFn: () => apiClient<SearchResult[]>(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=20`),
    enabled: query.length >= 2,
    staleTime: 10000,
  });
}
