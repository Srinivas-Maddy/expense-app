import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createTestToken } from "./helpers";

vi.mock("@expense-app/db", () => {
  const mockPrisma = {
    expense: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findFirst: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import { prisma } from "@expense-app/db";
const mockPrisma = prisma as any;

const userId = "user-123";
const token = createTestToken(userId);

describe("Expense Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/expenses", () => {
    it("should return paginated expenses", async () => {
      mockPrisma.expense.findMany.mockResolvedValue([
        {
          id: "exp-1",
          amount: { toNumber: () => 25.5 },
          description: "Lunch",
          date: new Date("2026-03-01"),
          categoryId: "cat-1",
          category: { id: "cat-1", name: "Food", color: "#FF6B6B" },
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockPrisma.expense.count.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/expenses")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/expenses");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/expenses", () => {
    it("should create an expense", async () => {
      mockPrisma.category.findFirst.mockResolvedValue({ id: "cat-1", name: "Food" });
      mockPrisma.expense.create.mockResolvedValue({
        id: "exp-new",
        amount: 15.99,
        description: "Coffee",
        date: new Date("2026-03-15"),
        categoryId: "cat-1",
        category: { id: "cat-1", name: "Food", color: "#FF6B6B" },
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 15.99,
          description: "Coffee",
          date: "2026-03-15",
          categoryId: "00000000-0000-0000-0000-000000000001",
        });

      expect(res.status).toBe(201);
      expect(res.body.description).toBe("Coffee");
    });

    it("should return 400 for invalid data", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: -5 });

      expect(res.status).toBe(400);
    });

    it("should return 404 for invalid category", async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 10,
          description: "Test",
          date: "2026-03-15",
          categoryId: "00000000-0000-0000-0000-000000000099",
        });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/expenses/:id", () => {
    it("should delete an expense", async () => {
      mockPrisma.expense.findFirst.mockResolvedValue({ id: "exp-1", userId });
      mockPrisma.expense.delete.mockResolvedValue({});

      const res = await request(app)
        .delete("/api/expenses/exp-1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it("should return 404 for another user's expense", async () => {
      mockPrisma.expense.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/expenses/exp-other")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
