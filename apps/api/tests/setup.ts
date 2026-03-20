import { beforeAll, afterAll } from "vitest";

// Set test environment variables before any imports that read them
process.env.DATABASE_URL = "postgresql://expense_user:expense_pass@localhost:5432/expense_test_db";
process.env.JWT_SECRET = "test-jwt-secret-at-least-10-chars";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-at-least-10-chars";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.LOG_LEVEL = "silent";
process.env.NODE_ENV = "test";

beforeAll(() => {
  // Global setup if needed
});

afterAll(() => {
  // Global teardown if needed
});
