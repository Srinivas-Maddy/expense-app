import { Router, Request, Response, NextFunction } from "express";
import { createIncomeSchema, updateIncomeSchema, incomeQuerySchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as incomeService from "../services/income.service";

const router = Router();
router.use(authenticate);

router.get("/", validate(incomeQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incomeService.getIncomes(req.user!.userId, req.query as any);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/", validate(createIncomeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incomeService.createIncome(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put("/:id", validate(updateIncomeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incomeService.updateIncome(req.user!.userId, req.params.id as string, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await incomeService.deleteIncome(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
