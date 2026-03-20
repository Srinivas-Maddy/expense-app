import { Router, Request, Response, NextFunction } from "express";
import { createTagSchema, updateTagSchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as tagService from "../services/tag.service";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tagService.getTags(req.user!.userId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/", validate(createTagSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tagService.createTag(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.put("/:id", validate(updateTagSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tagService.updateTag(req.user!.userId, req.params.id as string, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tagService.deleteTag(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
