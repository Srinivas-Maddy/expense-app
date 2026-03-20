"use client";

import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
import { TopLoader } from "@/components/top-loader";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
