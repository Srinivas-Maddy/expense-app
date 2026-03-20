import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createTestToken } from "./helpers";

vi.mock("@expense-app/db", () => {
  const mockPrisma = {
    recurringExpense: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    expense: { create: vi.fn() },
    notification: { create: vi.fn() },
  };
  return { prisma: mockPrisma };
});

import { prisma } from "@expense-app/db";
const mockPrisma = prisma as any;
const userId = "user-123";
const token = createTestToken(userId);

describe("Recurring Expense Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/recurring-expenses", () => {
    it("should return recurring expenses", async () => {
      mockPrisma.recurringExpense.findMany.mockResolvedValue([
        { id: "r1", amount: 50, description: "Netflix", frequency: "monthly", isActive: true, nextRunDate: new Date(), userId },
      ]);

      const res = await request(app)
        .get("/api/recurring-expenses")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe("Netflix");
    });
  });

  describe("POST /api/recurring-expenses", () => {
    it("should create a recurring expense", async () => {
      mockPrisma.recurringExpense.create.mockResolvedValue({
        id: "r-new", amount: 15.99, description: "Spotify", frequency: "monthly",
        isActive: true, startDate: new Date("2026-04-01"), nextRunDate: new Date("2026-04-01"), userId,
      });

      const res = await request(app)
        .post("/api/recurring-expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 15.99,
          description: "Spotify",
          categoryId: "00000000-0000-0000-0000-000000000001",
          frequency: "monthly",
          startDate: "2026-04-01",
        });

      expect(res.status).toBe(201);
    });

    it("should reject invalid frequency", async () => {
      const res = await request(app)
        .post("/api/recurring-expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 10,
          description: "Test",
          categoryId: "00000000-0000-0000-0000-000000000001",
          frequency: "biweekly",
          startDate: "2026-04-01",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/recurring-expenses/:id/toggle", () => {
    it("should toggle active state", async () => {
      mockPrisma.recurringExpense.findFirst.mockResolvedValue({ id: "r1", userId, isActive: true });
      mockPrisma.recurringExpense.update.mockResolvedValue({ id: "r1", amount: 50, isActive: false });

      const res = await request(app)
        .patch("/api/recurring-expenses/r1/toggle")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
