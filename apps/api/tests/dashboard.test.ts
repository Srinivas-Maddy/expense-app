import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createTestToken } from "./helpers";

vi.mock("@expense-app/db", () => {
  const mockPrisma = {
    expense: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    income: {
      aggregate: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import { prisma } from "@expense-app/db";
const mockPrisma = prisma as any;

const userId = "user-123";
const token = createTestToken(userId);

describe("Dashboard Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/dashboard/summary", () => {
    it("should return monthly summary", async () => {
      mockPrisma.expense.aggregate.mockResolvedValue({ _sum: { amount: 500 } });
      mockPrisma.income.aggregate.mockResolvedValue({ _sum: { amount: 2000 } });

      const res = await request(app)
        .get("/api/dashboard/summary?month=2026-03")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalIncome).toBe(2000);
      expect(res.body.totalExpenses).toBe(500);
      expect(res.body.balance).toBe(1500);
    });

    it("should return zeros for empty month", async () => {
      mockPrisma.expense.aggregate.mockResolvedValue({ _sum: { amount: null } });
      mockPrisma.income.aggregate.mockResolvedValue({ _sum: { amount: null } });

      const res = await request(app)
        .get("/api/dashboard/summary?month=2026-01")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.balance).toBe(0);
    });

    it("should return 400 for invalid month format", async () => {
      const res = await request(app)
        .get("/api/dashboard/summary?month=March")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/dashboard/category-breakdown", () => {
    it("should return category breakdown with percentages", async () => {
      mockPrisma.expense.groupBy.mockResolvedValue([
        { categoryId: "cat-1", _sum: { amount: 300 } },
        { categoryId: "cat-2", _sum: { amount: 200 } },
      ]);
      mockPrisma.category.findMany.mockResolvedValue([
        { id: "cat-1", name: "Food", color: "#FF6B6B" },
        { id: "cat-2", name: "Travel", color: "#4ECDC4" },
      ]);

      const res = await request(app)
        .get("/api/dashboard/category-breakdown?month=2026-03")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].categoryName).toBe("Food");
      expect(res.body[0].percentage).toBe(60);
      expect(res.body[1].percentage).toBe(40);
    });

    it("should return empty array for no expenses", async () => {
      mockPrisma.expense.groupBy.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/dashboard/category-breakdown?month=2026-03")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
