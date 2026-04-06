import { Router } from "express";
import { z } from "zod";
import { runScan } from "../services/analysis.js";
import { getReport, saveLead, saveReport } from "../storage/storage.js";

const scanSchema = z.object({ url: z.string().min(3) });
const leadSchema = z.object({
  reportId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  businessName: z.string().min(2),
  city: z.string().min(2),
  monthlyBudget: z.string().optional(),
});

export const apiRouter = Router();

apiRouter.post("/scan", async (req, res) => {
  const parsed = scanSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please enter a valid URL." });

  try {
    const report = await runScan(parsed.data.url);
    await saveReport(report);
    return res.json({ reportId: report.id, lockedSummary: report.lockedSummary, scores: report.scores });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Scan failed." });
  }
});

apiRouter.post("/unlock", async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please complete all required fields." });

  const report = await getReport(parsed.data.reportId);
  if (!report) return res.status(404).json({ error: "Report not found." });

  await saveLead({ ...parsed.data, createdAt: new Date().toISOString() });
  return res.json({ report });
});

apiRouter.get("/report/:id", async (req, res) => {
  const report = await getReport(req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found." });

  return res.json({
    reportId: report.id,
    lockedSummary: report.lockedSummary,
    scores: report.scores,
    teaserRevenue: report.revenueOpportunity,
  });
});
