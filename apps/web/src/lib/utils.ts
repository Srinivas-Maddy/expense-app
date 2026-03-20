import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@expense-app/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode?: string): string {
  const code = currencyCode || (typeof window !== "undefined" && localStorage.getItem("userCurrency")) || DEFAULT_CURRENCY;
  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  const locale = currencyInfo?.locale || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
