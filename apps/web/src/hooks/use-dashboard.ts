"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DashboardSummary, CategoryBreakdown, MonthComparison } from "@expense-app/shared";

export function useDashboardSummary(month: string) {
  return useQuery({
    queryKey: ["dashboard", "summary", month],
    queryFn: () => apiClient<DashboardSummary>(`/dashboard/summary?month=${month}`),
  });
}

export function useCategoryBreakdown(month: string) {
  return useQuery({
    queryKey: ["dashboard", "breakdown", month],
    queryFn: () => apiClient<CategoryBreakdown[]>(`/dashboard/category-breakdown?month=${month}`),
  });
}

export function useMonthComparison(month: string) {
  return useQuery({
    queryKey: ["dashboard", "comparison", month],
    queryFn: () => apiClient<MonthComparison>(`/dashboard/comparison?month=${month}`),
  });
}
