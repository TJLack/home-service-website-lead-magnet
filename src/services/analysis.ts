import { randomUUID } from "node:crypto";
import { crawlSite } from "./crawler.js";
import { extractPage } from "./pageExtractor.js";
import { captureScreenshots } from "./screenshotService.js";
import { scoreAiReadiness, scoreConversion, scoreDesign, scoreSeo } from "./scoringEngine.js";
import { calculateRevenueOpportunity, detectIndustry } from "./revenueEngine.js";
import { buildIssues, buildRecommendations } from "./reportBuilder.js";
import { normalizeUrl } from "../utils/urlHandler.js";
import type { ScanReport } from "../models/types.js";

export async function runScan(submittedUrl: string): Promise<ScanReport> {
  const normalizedUrl = normalizeUrl(submittedUrl);
  const reportId = randomUUID();

  const crawled = await crawlSite(normalizedUrl);
  if (!crawled.length) {
    throw new Error("We couldn\'t crawl enough pages to analyze this site.");
  }
  const pages = crawled.map(extractPage);

  const screenshots: { mobileHomepage?: string; desktopHomepage?: string } =
    await captureScreenshots(normalizedUrl, reportId).catch(() => ({}));

  const design = scoreDesign(pages, Boolean(screenshots.mobileHomepage || screenshots.desktopHomepage));
  const seo = scoreSeo(pages);
  const conversion = scoreConversion(pages);
  const ai = scoreAiReadiness(pages);

  const overall = Math.round(design.score * 0.2 + seo.score * 0.3 + conversion.score * 0.3 + ai.score * 0.2);

  const industry = detectIndustry(pages);
  const revenue = calculateRevenueOpportunity({
    pages,
    industry: industry.primaryIndustry,
    seoScore: seo.score,
    conversionScore: conversion.score,
    designScore: design.score,
  });

  const topIssues = buildIssues({
    pages,
    designScore: design.score,
    seoScore: seo.score,
    conversionScore: conversion.score,
    aiScore: ai.score,
  });

  const report: ScanReport = {
    id: reportId,
    submittedUrl,
    normalizedUrl,
    scannedAt: new Date().toISOString(),
    siteSummary: {
      pagesScanned: pages.length,
      primaryIndustry: industry.primaryIndustry,
      confidenceLevel: industry.confidence,
    },
    screenshots,
    scores: {
      overall,
      design: design.score,
      seo: seo.score,
      conversion: conversion.score,
      aiReadiness: ai.score,
    },
    subScores: {
      aiReadiness: ai.subScores,
    },
    revenueOpportunity: revenue,
    topIssues,
    recommendations: buildRecommendations(topIssues),
    pageFindings: pages.map((p) => ({
      url: p.url,
      pageType: p.pageType,
      title: p.title,
      wordCount: p.wordCount,
      issues: [
        ...(p.wordCount < 150 ? ["Thin content"] : []),
        ...(!p.signals.hasForm && !p.signals.hasClickToCall ? ["No strong conversion path"] : []),
        ...(p.keywordSignals.locationKeywords === 0 ? ["Weak location signals"] : []),
      ],
      scoreHints: {
        design: Math.max(40, Math.min(95, 50 + p.h2.length * 3 + (p.signals.hasTrustBadges ? 8 : 0))),
        seo: Math.max(35, Math.min(95, 45 + p.keywordSignals.serviceKeywords * 5 + p.keywordSignals.locationKeywords * 4)),
        conversion: Math.max(30, Math.min(95, 40 + (p.signals.hasForm ? 20 : 0) + (p.signals.hasClickToCall ? 15 : 0))),
        ai: Math.max(35, Math.min(95, 40 + (p.signals.hasFaqContent ? 15 : 0) + p.keywordSignals.trustKeywords * 3)),
      },
    })),
    lockedSummary: {
      issuesFound: topIssues.length,
      teaser: [
        `We found ${topIssues.length} issues affecting your site performance.`,
        `Your website score is ${overall}/100 and below where it should be for lead generation.`,
        `Your AI Search Readiness is ${ai.score}/100 and weaker than expected for future search trends.`,
        `You may be missing meaningful monthly revenue based on current conversion signals.`,
      ],
    },
  };

  return report;
}
