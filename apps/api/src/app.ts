import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth.routes";
import expenseRoutes from "./routes/expense.routes";
import incomeRoutes from "./routes/income.routes";
import categoryRoutes from "./routes/category.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import budgetRoutes from "./routes/budget.routes";
import trendRoutes from "./routes/trend.routes";
import recurringRoutes from "./routes/recurring.routes";
import accountRoutes from "./routes/account.routes";
import notificationRoutes from "./routes/notification.routes";
import exportRoutes from "./routes/export.routes";
import tagRoutes from "./routes/tag.routes";
import searchRoutes from "./routes/search.routes";
import smartRoutes from "./routes/smart.routes";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(apiLimiter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Phase 1 routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Phase 2 routes
app.use("/api/budgets", budgetRoutes);
app.use("/api/trends", trendRoutes);

// Phase 3 routes
app.use("/api/recurring-expenses", recurringRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/smart", smartRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
