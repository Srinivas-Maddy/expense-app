import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createTestToken } from "./helpers";

vi.mock("@expense-app/db", () => {
  const mockPrisma = {
    budget: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    expense: { aggregate: vi.fn() },
    category: { findFirst: vi.fn() },
    notification: { findFirst: vi.fn(), create: vi.fn() },
  };
  return { prisma: mockPrisma };
});

import { prisma } from "@expense-app/db";
const mockPrisma = prisma as any;
const userId = "user-123";
const token = createTestToken(userId);

describe("Budget Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/budgets", () => {
    it("should return budgets with spending info", async () => {
      mockPrisma.budget.findMany.mockResolvedValue([
        { id: "b1", userId, categoryId: null, category: null, month: "2026-03", amount: 1000 },
      ]);
      mockPrisma.expense.aggregate.mockResolvedValue({ _sum: { amount: 600 } });

      const res = await request(app)
        .get("/api/budgets?month=2026-03")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].spent).toBe(600);
      expect(res.body[0].remaining).toBe(400);
      expect(res.body[0].percentUsed).toBe(60);
      expect(res.body[0].isExceeded).toBe(false);
    });

    it("should detect exceeded budgets", async () => {
      mockPrisma.budget.findMany.mockResolvedValue([
        { id: "b1", userId, categoryId: null, category: null, month: "2026-03", amount: 500 },
      ]);
      mockPrisma.expense.aggregate.mockResolvedValue({ _sum: { amount: 750 } });

      const res = await request(app)
        .get("/api/budgets?month=2026-03")
        .set("Authorization", `Bearer ${token}`);

      expect(res.body[0].isExceeded).toBe(true);
      expect(res.body[0].percentUsed).toBe(150);
    });
  });

  describe("POST /api/budgets", () => {
    it("should create a budget", async () => {
      mockPrisma.budget.findFirst.mockResolvedValue(null);
      mockPrisma.budget.create.mockResolvedValue({
        id: "b-new", userId, categoryId: null, category: null, month: "2026-03", amount: 2000,
      });

      const res = await request(app)
        .post("/api/budgets")
        .set("Authorization", `Bearer ${token}`)
        .send({ month: "2026-03", amount: 2000 });

      expect(res.status).toBe(201);
    });

    it("should reject duplicate budget", async () => {
      mockPrisma.budget.findFirst.mockResolvedValue({ id: "existing" });

      const res = await request(app)
        .post("/api/budgets")
        .set("Authorization", `Bearer ${token}`)
        .send({ month: "2026-03", amount: 2000 });

      expect(res.status).toBe(409);
    });
  });
});
