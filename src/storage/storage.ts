import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LeadData, ScanReport } from "../models/types.js";

const dataDir = path.resolve("data");
const reportsFile = path.join(dataDir, "reports.json");
const leadsFile = path.join(dataDir, "leads.json");

async function ensureFile(file: string): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(file, "utf-8");
  } catch {
    await writeFile(file, "[]", "utf-8");
  }
}

async function readJson<T>(file: string): Promise<T[]> {
  await ensureFile(file);
  const raw = await readFile(file, "utf-8");
  return JSON.parse(raw) as T[];
}

async function writeJson<T>(file: string, data: T[]): Promise<void> {
  await ensureFile(file);
  await writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function saveReport(report: ScanReport): Promise<void> {
  const all = await readJson<ScanReport>(reportsFile);
  all.unshift(report);
  await writeJson(reportsFile, all);
}

export async function getReport(reportId: string): Promise<ScanReport | null> {
  const all = await readJson<ScanReport>(reportsFile);
  return all.find((r) => r.id === reportId) ?? null;
}

export async function saveLead(lead: LeadData): Promise<void> {
  const all = await readJson<LeadData>(leadsFile);
  all.unshift(lead);
  await writeJson(leadsFile, all);
}
