import { Router, Request, Response, NextFunction } from "express";
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as expenseService from "../services/expense.service";

const router = Router();
router.use(authenticate);

router.get("/", validate(expenseQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.getExpenses(req.user!.userId, req.query as any);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/", validate(createExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.createExpense(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put("/:id", validate(updateExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.updateExpense(req.user!.userId, req.params.id as string, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseService.deleteExpense(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
