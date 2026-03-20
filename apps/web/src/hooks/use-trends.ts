"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { MonthlyTrend } from "@expense-app/shared";

export function useMonthlyTrends(months = 6) {
  return useQuery({
    queryKey: ["trends", "monthly", months],
    queryFn: () => apiClient<MonthlyTrend[]>(`/trends/monthly?months=${months}`),
  });
}
