import { Router, Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import { authenticate } from "../middleware/auth";
import * as authService from "../services/auth.service";

const router = Router();

router.use(authLimiter);

router.post("/signup", validate(signupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.signup(req.body.name, req.body.email, req.body.password, req.body.currency);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.post("/login", validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/refresh", validate(refreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/logout", validate(refreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ message: "Logged out" });
  } catch (err) { next(err); }
});

router.get("/profile", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.getProfile(req.user!.userId);
    res.json(result);
  } catch (err) { next(err); }
});

router.put("/profile", authenticate, validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.updateProfile(req.user!.userId, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/forgot-password", validate(forgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/reset-password", validate(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
