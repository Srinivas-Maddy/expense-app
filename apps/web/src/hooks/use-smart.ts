"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CategorySuggestion, MoneyLeaksReport } from "@expense-app/shared";

export function useSuggestCategory() {
  return useMutation({
    mutationFn: (description: string) =>
      apiClient<CategorySuggestion[]>("/smart/suggest-category", {
        method: "POST",
        body: JSON.stringify({ description }),
      }),
  });
}

export function useMoneyLeaks() {
  return useQuery({
    queryKey: ["smart", "money-leaks"],
    queryFn: () => apiClient<MoneyLeaksReport>("/smart/money-leaks"),
  });
}
