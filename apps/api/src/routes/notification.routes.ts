import { Router, Request, Response, NextFunction } from "express";
import { notificationQuerySchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import * as notifService from "../services/notification.service";

const router = Router();
router.use(authenticate);

router.get("/", validate(notificationQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notifService.getNotifications(req.user!.userId, req.query as any);
    res.json(result);
  } catch (err) { next(err); }
});

router.get("/unread-count", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notifService.getUnreadCount(req.user!.userId);
    res.json({ count });
  } catch (err) { next(err); }
});

router.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notifService.markAsRead(req.user!.userId, req.params.id as string);
    res.json(result);
  } catch (err) { next(err); }
});

router.patch("/read-all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notifService.markAllAsRead(req.user!.userId);
    res.json({ message: "All notifications marked as read" });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notifService.deleteNotification(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
