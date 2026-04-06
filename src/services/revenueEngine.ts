import { DEFAULT_JOB_VALUES, INDUSTRY_KEYWORDS } from "../config/constants.js";
import type { ConfidenceLevel, ExtractedPage } from "../models/types.js";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function detectIndustry(pages: ExtractedPage[]): { primaryIndustry: string; confidence: ConfidenceLevel } {
  const text = pages.map((p) => `${p.title} ${p.visibleText}`).join(" ").toLowerCase();
  let best = "General Home Services";
  let bestScore = 0;

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    const score = keywords.reduce((acc, k) => acc + (text.includes(k.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      best = industry;
      bestScore = score;
    }
  }

  const confidence: ConfidenceLevel = bestScore >= 4 ? "high" : bestScore >= 2 ? "medium" : "low";
  return { primaryIndustry: best, confidence };
}

export function calculateRevenueOpportunity(params: {
  pages: ExtractedPage[];
  industry: string;
  seoScore: number;
  conversionScore: number;
  designScore: number;
}): {
  lowMonthly: number;
  highMonthly: number;
  lowAnnual: number;
  highAnnual: number;
  avgJobValue: number;
  estimatedTrafficLow: number;
  estimatedTrafficHigh: number;
  currentConversionLow: number;
  currentConversionHigh: number;
  projectedConversionLow: number;
  projectedConversionHigh: number;
  confidence: ConfidenceLevel;
  narrative: string;
} {
  const { pages, industry, seoScore, conversionScore, designScore } = params;
  const totalWords = pages.reduce((sum, p) => sum + p.wordCount, 0);
  const servicePages = pages.filter((p) => p.pageType === "service").length;
  const locationPages = pages.filter((p) => p.pageType === "location").length;

  let trafficLow = 100;
  let trafficHigh = 300;
  const maturityScore = seoScore * 0.45 + pages.length * 4 + servicePages * 6 + locationPages * 5 + Math.min(20, totalWords / 250);
  if (maturityScore > 80) {
    trafficLow = 300;
    trafficHigh = 800;
  }
  if (maturityScore > 130) {
    trafficLow = 800;
    trafficHigh = 2000;
  }
  if (maturityScore > 180) {
    trafficLow = 1300;
    trafficHigh = 2600;
  }

  const baseJob = DEFAULT_JOB_VALUES[industry] ?? DEFAULT_JOB_VALUES["General Home Services"];
  const textBlob = pages.map((p) => p.visibleText).join(" ").toLowerCase();
  let adjustment = 1;
  if (/install|replacement|premium|custom/.test(textBlob)) adjustment += 0.15;
  if (/financing|monthly payment/.test(textBlob)) adjustment += 0.1;
  if (/emergency|same day/.test(textBlob)) adjustment += 0.08;
  if (/commercial/.test(textBlob)) adjustment += 0.07;
  if (/maintenance|inspection/.test(textBlob)) adjustment -= 0.05;
  adjustment = clamp(adjustment, 0.75, 1.35);
  const avgJobValue = Math.round(baseJob * adjustment);

  let currentLow = 0.005;
  let currentHigh = 0.015;
  if (conversionScore > 45) {
    currentLow = 0.01;
    currentHigh = 0.02;
  }
  if (conversionScore > 65) {
    currentLow = 0.02;
    currentHigh = 0.03;
  }
  if (conversionScore > 80 && designScore > 75) {
    currentLow = 0.03;
    currentHigh = 0.04;
  }

  const higherTicket = avgJobValue >= 2500;
  let projectedLow = higherTicket ? 0.03 : 0.04;
  let projectedHigh = higherTicket ? 0.06 : 0.08;
  if (conversionScore > 80) {
    projectedLow = Math.max(projectedLow, currentLow + 0.008);
    projectedHigh = Math.max(projectedHigh, currentHigh + 0.015);
  }

  const lowMonthly = Math.round(trafficLow * (projectedLow - currentHigh) * avgJobValue);
  const highMonthly = Math.round(trafficHigh * (projectedHigh - currentLow) * avgJobValue);

  const confidence: ConfidenceLevel =
    pages.length >= 7 && servicePages >= 2 && industry !== "General Home Services"
      ? "high"
      : pages.length >= 4
      ? "medium"
      : "low";

  const narrative =
    `Based on crawlable content, your current site likely converts around ${(currentLow * 100).toFixed(1)}%–${(currentHigh * 100).toFixed(
      1
    )}%. ` +
    `With clearer CTAs, stronger trust proof, and better service-city structure, many similar Texas home service websites improve into ${(projectedLow * 100).toFixed(
      1
    )}%–${(projectedHigh * 100).toFixed(1)}% conversion territory.`;

  return {
    lowMonthly: Math.max(0, lowMonthly),
    highMonthly: Math.max(Math.max(0, lowMonthly + 100), highMonthly),
    lowAnnual: Math.max(0, lowMonthly) * 12,
    highAnnual: Math.max(Math.max(0, lowMonthly + 100), highMonthly) * 12,
    avgJobValue,
    estimatedTrafficLow: trafficLow,
    estimatedTrafficHigh: trafficHigh,
    currentConversionLow: currentLow,
    currentConversionHigh: currentHigh,
    projectedConversionLow: projectedLow,
    projectedConversionHigh: projectedHigh,
    confidence,
    narrative,
  };
}
