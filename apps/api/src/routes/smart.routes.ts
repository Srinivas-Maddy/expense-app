import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as smartService from "../services/smart.service";

const router = Router();
router.use(authenticate);

const suggestSchema = z.object({
  description: z.string().min(1).max(500),
});

router.post("/suggest-category", validate(suggestSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await smartService.suggestCategory(req.user!.userId, req.body.description);
    res.json(result);
  } catch (err) { next(err); }
});

router.get("/money-leaks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await smartService.detectMoneyLeaks(req.user!.userId);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
