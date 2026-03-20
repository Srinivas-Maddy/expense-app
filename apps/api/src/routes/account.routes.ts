import { Router, Request, Response, NextFunction } from "express";
import { createAccountSchema, updateAccountSchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as accountService from "../services/account.service";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await accountService.getAccounts(req.user!.userId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/", validate(createAccountSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await accountService.createAccount(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put("/:id", validate(updateAccountSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await accountService.updateAccount(req.user!.userId, req.params.id as string, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await accountService.deleteAccount(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
