import { Router, Request, Response, NextFunction } from "express";
import { createRecurringExpenseSchema, updateRecurringExpenseSchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as recurringService from "../services/recurring.service";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await recurringService.getRecurringExpenses(req.user!.userId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/", validate(createRecurringExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await recurringService.createRecurringExpense(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put("/:id", validate(updateRecurringExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await recurringService.updateRecurringExpense(req.user!.userId, req.params.id as string, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await recurringService.deleteRecurringExpense(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
});

router.patch("/:id/toggle", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await recurringService.toggleRecurringExpense(req.user!.userId, req.params.id as string);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/process", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await recurringService.processRecurringExpenses();
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
