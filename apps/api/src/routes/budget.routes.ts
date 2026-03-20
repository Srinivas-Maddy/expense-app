import { Router, Request, Response, NextFunction } from "express";
import { createBudgetSchema, updateBudgetSchema, dashboardQuerySchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as budgetService from "../services/budget.service";

const router = Router();
router.use(authenticate);

router.get("/", validate(dashboardQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await budgetService.getBudgets(req.user!.userId, (req.query as any).month);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/", validate(createBudgetSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await budgetService.createBudget(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put("/:id", validate(updateBudgetSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await budgetService.updateBudget(req.user!.userId, req.params.id as string, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await budgetService.deleteBudget(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
});

router.get("/alerts", validate(dashboardQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await budgetService.checkBudgetAlerts(req.user!.userId, (req.query as any).month);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
