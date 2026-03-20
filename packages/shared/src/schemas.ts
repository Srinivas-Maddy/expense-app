import { z } from "zod";

// Auth schemas
export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  currency: z.string().length(3).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currency: z.string().length(3).optional(),
});

// Expense schemas
export const createExpenseSchema = z.object({
  amount: z.number().positive().multipleOf(0.01),
  description: z.string().min(1).max(500),
  currency: z.string().length(3).optional(),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
  categoryId: z.string().uuid(),
  accountId: z.string().uuid().optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional(),
  newTags: z.array(z.string().min(1).max(50)).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// Income schemas
export const createIncomeSchema = z.object({
  amount: z.number().positive().multipleOf(0.01),
  description: z.string().min(1).max(500),
  currency: z.string().length(3).optional(),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
  source: z.string().min(1).max(200),
  accountId: z.string().uuid().optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional(),
  newTags: z.array(z.string().min(1).max(50)).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

// Query schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateFilterSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

export const expenseQuerySchema = paginationSchema.merge(dateFilterSchema).extend({
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  tagId: z.string().uuid().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export const incomeQuerySchema = paginationSchema.merge(dateFilterSchema).extend({
  accountId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  tagId: z.string().uuid().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

// Tag schemas
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const updateTagSchema = createTagSchema.partial();

// Search schema
export const globalSearchSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["all", "expenses", "income"]).default("all"),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const dashboardQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

// Phase 2: Budget schemas
export const createBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().positive().multipleOf(0.01),
  categoryId: z.string().uuid().optional().nullable(),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive().multipleOf(0.01),
});

// Phase 2: Trend query
export const trendQuerySchema = z.object({
  months: z.coerce.number().int().min(2).max(24).default(6),
});

// Phase 3: Recurring Expense schemas
export const createRecurringExpenseSchema = z.object({
  amount: z.number().positive().multipleOf(0.01),
  description: z.string().min(1).max(500),
  categoryId: z.string().uuid(),
  accountId: z.string().uuid().optional().nullable(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().date(),
  endDate: z.string().date().optional().nullable(),
});

export const updateRecurringExpenseSchema = createRecurringExpenseSchema.partial();

// Phase 3: Account schemas
export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["cash", "bank", "wallet", "credit_card"]),
  balance: z.number().multipleOf(0.01).default(0),
  currency: z.string().length(3).default("INR"),
});

export const updateAccountSchema = createAccountSchema.partial();

// Phase 3: Export schema
export const exportQuerySchema = z.object({
  format: z.enum(["pdf", "excel"]),
  startDate: z.string().date(),
  endDate: z.string().date(),
  type: z.enum(["expenses", "income", "all"]).default("all"),
});

// Phase 3: Notification schemas
export const notificationQuerySchema = paginationSchema.extend({
  unreadOnly: z.coerce.boolean().optional().default(false),
});
