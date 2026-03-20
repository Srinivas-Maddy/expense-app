import { Router, Request, Response, NextFunction } from "express";
import { globalSearchSchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as searchService from "../services/search.service";

const router = Router();
router.use(authenticate);

router.get("/", validate(globalSearchSchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, type, limit } = req.query as any;
    const result = await searchService.globalSearch(req.user!.userId, q, type, limit);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
