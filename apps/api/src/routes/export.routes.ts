import { Router, Request, Response, NextFunction } from "express";
import { exportQuerySchema } from "@expense-app/shared";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { prisma } from "@expense-app/db";
import * as exportService from "../services/export.service";

const router = Router();
router.use(authenticate);

router.get("/", validate(exportQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const rows = await exportService.generateExportData(req.user!.userId, query);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.userId } });

    if (query.format === "excel") {
      // CSV download (Excel-compatible)
      const csv = exportService.toCsv(rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=report_${query.startDate}_${query.endDate}.csv`);
      res.send(csv);
    } else {
      // PDF-like HTML download
      const html = exportService.toHtml(rows, query.startDate, query.endDate, user.currency);
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Content-Disposition", `attachment; filename=report_${query.startDate}_${query.endDate}.html`);
      res.send(html);
    }
  } catch (err) { next(err); }
});

export default router;
