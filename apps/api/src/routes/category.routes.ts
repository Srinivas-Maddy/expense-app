import { Router, Request, Response, NextFunction } from "express";
import { createCategorySchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as categoryService from "../services/category.service";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.getCategories(req.user!.userId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/", validate(createCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.createCategory(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.deleteCategory(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
