import { Router, Request, Response, NextFunction } from "express";
import { trendQuerySchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as trendService from "../services/trend.service";

const router = Router();
router.use(authenticate);

router.get("/monthly", validate(trendQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await trendService.getMonthlyTrends(req.user!.userId, (req.query as any).months);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
