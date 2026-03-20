import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@expense-app/db";
import { REFRESH_TOKEN_EXPIRY_DAYS, DEFAULT_CURRENCY } from "@expense-app/shared";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import type { AuthPayload } from "../middleware/auth";

function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

function userResponse(user: { id: string; name: string; email: string; currency: string; createdAt: Date }) {
  return { id: user.id, name: user.name, email: user.email, currency: user.currency, createdAt: user.createdAt.toISOString() };
}

export async function signup(name: string, email: string, password: string, currency?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, "CONFLICT", "Email already registered");

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, currency: currency || DEFAULT_CURRENCY },
  });

  const tokens = await createTokens({ userId: user.id, email: user.email });
  return { user: userResponse(user), ...tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");

  const tokens = await createTokens({ userId: user.id, email: user.email });
  return { user: userResponse(user), ...tokens };
}

export async function refresh(token: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired refresh token");
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });
  const tokens = await createTokens({ userId: user.id, email: user.email });
  return { user: userResponse(user), ...tokens };
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return userResponse(user);
}

export async function updateProfile(userId: string, data: { name?: string; currency?: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return userResponse(user);
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return { message: "If that email exists, a reset link has been sent" };
}

export async function resetPassword(token: string, newPassword: string) {
  throw new AppError(501, "NOT_IMPLEMENTED", "Password reset via email not yet implemented");
}

async function createTokens(payload: AuthPayload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}
