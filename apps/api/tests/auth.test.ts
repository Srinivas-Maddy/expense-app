import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";

// Mock Prisma
vi.mock("@expense-app/db", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
}));

import { prisma } from "@expense-app/db";
import bcrypt from "bcryptjs";

const mockPrisma = prisma as any;
const mockBcrypt = bcrypt as any;

describe("Auth Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user and return tokens", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        name: "Test",
        email: "test@example.com",
        createdAt: new Date(),
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test", email: "test@example.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("should return 409 if email already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test", email: "test@example.com", password: "password123" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "T", email: "bad", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login and return tokens", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Test",
        email: "test@example.com",
        password: "hashed_password",
        createdAt: new Date(),
      });
      mockBcrypt.compare.mockResolvedValue(true);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should return 401 for wrong password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        password: "hashed_password",
      });
      mockBcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrong" });

      expect(res.status).toBe(401);
    });

    it("should return 401 for non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should invalidate refresh token", async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const res = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: "some-refresh-token" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out");
    });
  });
});

describe("GET /api/health", () => {
  it("should return ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
