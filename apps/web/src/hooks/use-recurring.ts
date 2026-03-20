"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { RecurringExpense, CreateRecurringExpenseInput } from "@expense-app/shared";

export function useRecurringExpenses() {
  return useQuery({
    queryKey: ["recurring-expenses"],
    queryFn: () => apiClient<RecurringExpense[]>("/recurring-expenses"),
  });
}

export function useCreateRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecurringExpenseInput) =>
      apiClient<RecurringExpense>("/recurring-expenses", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-expenses"] }),
  });
}

export function useDeleteRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/recurring-expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-expenses"] }),
  });
}

export function useToggleRecurringExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<RecurringExpense>(`/recurring-expenses/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-expenses"] }),
  });
}
