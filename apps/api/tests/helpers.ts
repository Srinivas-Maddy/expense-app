import jwt from "jsonwebtoken";

export function createTestToken(userId: string, email = "test@example.com") {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: "15m" });
}

export const TEST_USER = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};
