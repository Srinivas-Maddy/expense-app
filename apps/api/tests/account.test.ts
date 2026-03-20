import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createTestToken } from "./helpers";

vi.mock("@expense-app/db", () => {
  const mockPrisma = {
    account: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    expense: { count: vi.fn() },
    income: { count: vi.fn() },
  };
  return { prisma: mockPrisma };
});

import { prisma } from "@expense-app/db";
const mockPrisma = prisma as any;
const userId = "user-123";
const token = createTestToken(userId);

describe("Account Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/accounts", () => {
    it("should return user accounts", async () => {
      mockPrisma.account.findMany.mockResolvedValue([
        { id: "acc-1", name: "Cash", type: "cash", balance: 500, currency: "USD", userId },
        { id: "acc-2", name: "Bank", type: "bank", balance: 3000, currency: "USD", userId },
      ]);

      const res = await request(app)
        .get("/api/accounts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe("POST /api/accounts", () => {
    it("should create an account", async () => {
      mockPrisma.account.findFirst.mockResolvedValue(null);
      mockPrisma.account.create.mockResolvedValue({
        id: "acc-new", name: "Savings", type: "bank", balance: 1000, currency: "USD", userId,
      });

      const res = await request(app)
        .post("/api/accounts")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Savings", type: "bank", balance: 1000 });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Savings");
    });

    it("should reject duplicate name", async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ id: "existing" });

      const res = await request(app)
        .post("/api/accounts")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Cash", type: "cash" });

      expect(res.status).toBe(409);
    });
  });

  describe("DELETE /api/accounts/:id", () => {
    it("should prevent deletion of accounts with transactions", async () => {
      mockPrisma.account.findFirst.mockResolvedValue({ id: "acc-1", userId });
      mockPrisma.expense.count.mockResolvedValue(5);
      mockPrisma.income.count.mockResolvedValue(0);

      const res = await request(app)
        .delete("/api/accounts/acc-1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("IN_USE");
    });
  });
});
