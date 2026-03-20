import { z } from "zod";
import {
  signupSchema,
  loginSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createIncomeSchema,
  updateIncomeSchema,
  createCategorySchema,
  expenseQuerySchema,
  incomeQuerySchema,
  dashboardQuerySchema,
  createBudgetSchema,
  updateBudgetSchema,
  trendQuerySchema,
  createRecurringExpenseSchema,
  updateRecurringExpenseSchema,
  createAccountSchema,
  updateAccountSchema,
  exportQuerySchema,
  notificationQuerySchema,
  createTagSchema,
  updateTagSchema,
  globalSearchSchema,
} from "./schemas";

// Auth types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Expense types
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;

// Income types
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type IncomeQuery = z.infer<typeof incomeQuerySchema>;

// Category types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

// Phase 2 types
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type TrendQuery = z.infer<typeof trendQuerySchema>;

// Phase 3 types
export type CreateRecurringExpenseInput = z.infer<typeof createRecurringExpenseSchema>;
export type UpdateRecurringExpenseInput = z.infer<typeof updateRecurringExpenseSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type ExportQuery = z.infer<typeof exportQuerySchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type GlobalSearchQuery = z.infer<typeof globalSearchSchema>;

// API response types
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  color: string | null;
}

export interface CategoryComparison {
  categoryId: string;
  categoryName: string;
  color: string | null;
  currentTotal: number;
  previousTotal: number;
  change: number;
  changePercent: number;
}

export interface MonthComparison {
  currentMonth: string;
  previousMonth: string;
  current: DashboardSummary;
  previous: DashboardSummary;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
  categoryComparison: CategoryComparison[];
  topIncreases: CategoryComparison[];
  topDecreases: CategoryComparison[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  userId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  currency: string;
  date: string;
  categoryId: string;
  category: { id: string; name: string; color: string | null };
  accountId: string | null;
  account?: { id: string; name: string; type: string } | null;
  tags: Tag[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  currency: string;
  date: string;
  source: string;
  accountId: string | null;
  account?: { id: string; name: string; type: string } | null;
  tags: Tag[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  type: "expense" | "income";
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  source?: string;
  tags: Tag[];
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  userId: string | null;
  isDefault: boolean;
}

// Phase 2
export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  category?: { id: string; name: string; color: string | null } | null;
  month: string;
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isExceeded: boolean;
}

export interface MonthlyTrend {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

// Phase 3
export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  accountId: string | null;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: "cash" | "bank" | "wallet" | "credit_card";
  balance: number;
  currency: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "budget_alert" | "reminder" | "recurring_created" | "export_ready";
  title: string;
  message: string;
  isRead: boolean;
  metadata: string | null;
  createdAt: string;
}

// Smart Features
export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number; // 0-100
  reason: string; // "keyword match", "past transaction", etc.
}

export interface MoneyLeak {
  type: "subscription" | "repeat_spend" | "impulse" | "rounding";
  title: string;
  description: string;
  amount: number;
  frequency: string;
  annualCost: number;
  transactions: { id: string; description: string; amount: number; date: string }[];
  severity: "high" | "medium" | "low";
}

export interface MoneyLeaksReport {
  totalLeaks: number;
  totalMonthly: number;
  totalAnnual: number;
  leaks: MoneyLeak[];
}
