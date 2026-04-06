import type { ExtractedPage } from "../models/types.js";

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

function weightedAverage(items: Array<{ value: number; weight: number }>): number {
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0) || 1;
  return items.reduce((sum, i) => sum + i.value * i.weight, 0) / totalWeight;
}

function pageWeight(page: ExtractedPage): number {
  if (page.pageType === "homepage") return 2;
  if (page.pageType === "service" || page.pageType === "contact") return 1.5;
  if (page.pageType === "faq" || page.pageType === "review") return 1.3;
  return 1;
}

export function scoreDesign(pages: ExtractedPage[], screenshotsAvailable: boolean): { score: number; notes: string[] } {
  const perPage = pages.map((p) => {
    let score = 45;
    if (p.wordCount > 300) score += 10;
    if (p.h1.length === 1) score += 8;
    if (p.h2.length >= 3) score += 8;
    if (p.keywordSignals.ctaKeywords > 1) score += 10;
    if (p.signals.hasTrustBadges) score += 8;
    if (p.signals.hasContactSection) score += 6;
    if (p.wordCount < 120) score -= 12;
    if (p.h1.length === 0 || p.h1.length > 2) score -= 6;
    return { value: clamp(score), weight: pageWeight(p) };
  });
  let score = weightedAverage(perPage);
  if (screenshotsAvailable) score += 6;
  else score -= 8;

  const notes: string[] = [];
  if (score < 60) notes.push("Layout and conversion flow feel thin for modern buyers.");
  if (!screenshotsAvailable) notes.push("Screenshot capture failed, reducing design confidence.");
  return { score: clamp(score), notes };
}

export function scoreSeo(pages: ExtractedPage[]): { score: number; notes: string[] } {
  const perPage = pages.map((p) => {
    let score = 40;
    if (p.title.length > 20) score += 12;
    if (p.metaDescription.length > 70) score += 10;
    if (p.h1.length === 1) score += 8;
    if (p.keywordSignals.serviceKeywords >= 2) score += 10;
    if (p.keywordSignals.locationKeywords >= 2) score += 8;
    if (p.wordCount > 250) score += 8;
    if (p.internalLinks.length > 10) score += 4;
    if (p.schema.hasJsonLd) score += 6;
    return { value: clamp(score), weight: pageWeight(p) };
  });

  const score = clamp(weightedAverage(perPage));
  const notes: string[] = [];
  if (score < 60) notes.push("Your service and city relevance is weaker than it should be.");
  return { score, notes };
}

export function scoreConversion(pages: ExtractedPage[]): { score: number; notes: string[] } {
  const perPage = pages.map((p) => {
    let score = 38;
    if (p.signals.hasClickToCall) score += 15;
    if (p.signals.hasForm) score += 12;
    if (p.signals.hasQuotePath) score += 10;
    if (p.signals.hasReviews) score += 10;
    if (p.signals.hasContactSection) score += 8;
    if (p.signals.hasServiceAreas) score += 6;
    if (p.signals.hasBookingButton) score += 6;
    if (!p.signals.hasForm && !p.signals.hasClickToCall) score -= 15;
    return { value: clamp(score), weight: pageWeight(p) };
  });
  const score = clamp(weightedAverage(perPage));
  const notes: string[] = [];
  if (score < 65) notes.push("Visitors may not see an obvious next step quickly enough.");
  return { score, notes };
}

export function scoreAiReadiness(pages: ExtractedPage[]) {
  const contentClarity = clamp(
    weightedAverage(
      pages.map((p) => ({ value: 8 + Math.min(17, (p.wordCount / 500) * 17 + p.h2.length * 1.2), weight: pageWeight(p) }))
    ),
    0,
    25
  );

  const serviceLocationStructure = clamp(
    weightedAverage(
      pages.map((p) => ({ value: 5 + p.keywordSignals.serviceKeywords * 4 + p.keywordSignals.locationKeywords * 3, weight: pageWeight(p) }))
    ),
    0,
    25
  );

  const trustAuthority = clamp(
    weightedAverage(
      pages.map((p) => ({ value: 4 + (p.signals.hasReviews ? 6 : 0) + (p.signals.hasTrustBadges ? 6 : 0) + p.keywordSignals.trustKeywords * 2, weight: pageWeight(p) }))
    ),
    0,
    20
  );

  const aiFriendlyAnswers = clamp(
    weightedAverage(
      pages.map((p) => ({ value: 3 + (p.signals.hasFaqContent ? 10 : 0) + (p.h2.filter((h) => h.includes("?")).length > 0 ? 4 : 0) + (p.wordCount > 350 ? 4 : 0), weight: pageWeight(p) }))
    ),
    0,
    20
  );

  const technicalStructure = clamp(
    weightedAverage(
      pages.map((p) => ({
        value:
          (p.title ? 2 : 0) +
          (p.metaDescription ? 2 : 0) +
          (p.h1.length ? 2 : 0) +
          (p.schema.hasJsonLd ? 2 : 0) +
          (p.media.imageCount ? Math.min(2, (p.media.withAltCount / Math.max(1, p.media.imageCount)) * 2) : 1),
        weight: pageWeight(p),
      }))
    ),
    0,
    10
  );

  const total = clamp(contentClarity + serviceLocationStructure + trustAuthority + aiFriendlyAnswers + technicalStructure);

  return {
    score: total,
    subScores: {
      contentClarity,
      serviceLocationStructure,
      trustAuthority,
      aiFriendlyAnswers,
      technicalStructure,
    },
  };
}
