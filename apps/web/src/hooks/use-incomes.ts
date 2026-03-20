"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Income, PaginatedResponse, CreateIncomeInput, UpdateIncomeInput } from "@expense-app/shared";

export function useIncomes(params?: Record<string, string>) {
  const search = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({
    queryKey: ["incomes", params],
    queryFn: () => apiClient<PaginatedResponse<Income>>(`/incomes${search}`),
  });
}

export function useCreateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncomeInput) =>
      apiClient<Income>("/incomes", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateIncomeInput & { id: string }) =>
      apiClient<Income>(`/incomes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/incomes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
