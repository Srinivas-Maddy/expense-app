import { Router, Request, Response, NextFunction } from "express";
import { dashboardQuerySchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as dashboardService from "../services/dashboard.service";

const router = Router();
router.use(authenticate);

router.get("/summary", validate(dashboardQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await dashboardService.getSummary(req.user!.userId, (req.query as any).month);
    res.json(result);
  } catch (err) { next(err); }
});

router.get("/category-breakdown", validate(dashboardQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await dashboardService.getCategoryBreakdown(req.user!.userId, (req.query as any).month);
    res.json(result);
  } catch (err) { next(err); }
});

router.get("/comparison", validate(dashboardQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await dashboardService.getMonthComparison(req.user!.userId, (req.query as any).month);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
