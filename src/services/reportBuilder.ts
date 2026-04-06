import type { ExtractedPage, ScanReport } from "../models/types.js";

function makeIssue(category: "design" | "seo" | "conversion" | "ai", severity: "low" | "medium" | "high", title: string, explanation: string, impact: string, recommendedFix: string) {
  return { category, severity, title, explanation, impact, recommendedFix };
}

export function buildIssues(params: {
  pages: ExtractedPage[];
  designScore: number;
  seoScore: number;
  conversionScore: number;
  aiScore: number;
}) {
  const { pages, designScore, seoScore, conversionScore, aiScore } = params;
  const issues = [] as ScanReport["topIssues"];

  const home = pages.find((p) => p.pageType === "homepage") ?? pages[0];

  if (home && !home.signals.hasClickToCall && !home.signals.hasForm) {
    issues.push(
      makeIssue(
        "conversion",
        "high",
        "No clear CTA above the fold",
        "Visitors are not given an obvious action quickly.",
        "More visitors leave before calling or requesting a quote.",
        "Add a persistent 'Call Now' and 'Get Free Estimate' CTA in the hero and nav."
      )
    );
  }

  if (seoScore < 65) {
    issues.push(
      makeIssue(
        "seo",
        "high",
        "Weak service + city relevance",
        "Search engines may struggle to connect your services to your target Texas areas.",
        "Lower local visibility means fewer qualified website visits.",
        "Create service + city landing pages with clear headings and location-specific copy."
      )
    );
  }

  if (pages.filter((p) => p.pageType === "service").length < 2) {
    issues.push(
      makeIssue(
        "seo",
        "medium",
        "Thin service page structure",
        "Your site has limited dedicated service content.",
        "Prospects and search engines get less clarity about what you offer.",
        "Build dedicated pages for each primary service with process, FAQs, and trust proof."
      )
    );
  }

  const trustPages = pages.filter((p) => p.signals.hasReviews || p.signals.hasTrustBadges).length;
  if (trustPages < Math.max(2, Math.floor(pages.length / 3))) {
    issues.push(
      makeIssue(
        "conversion",
        "medium",
        "Trust proof is underused",
        "Reviews, certifications, and proof of credibility are not consistently visible.",
        "Lower trust reduces quote form submissions and calls.",
        "Add review snippets, badges, and licensed/insured proof sitewide."
      )
    );
  }

  if (aiScore < 60) {
    issues.push(
      makeIssue(
        "ai",
        "medium",
        "AI answer structure is weak",
        "Content is not consistently organized into direct answers and clear sections.",
        "AI-driven search tools are less likely to summarize and recommend your business.",
        "Add FAQ blocks, question-based headings, and concise service explanations."
      )
    );
  }

  if (designScore < 60) {
    issues.push(
      makeIssue(
        "design",
        "medium",
        "Homepage feels outdated or thin",
        "The page structure appears light on segmentation and clarity.",
        "First impressions can hurt credibility and conversions.",
        "Redesign the homepage with a clean hero, clear sections, and repeated CTA anchors."
      )
    );
  }

  return issues.slice(0, 5);
}

export function buildRecommendations(issues: ScanReport["topIssues"]): ScanReport["recommendations"] {
  const mapped = issues.map((issue) => ({
    title: issue.title,
    description: issue.recommendedFix,
    priority: issue.severity,
  }));

  const defaults: ScanReport["recommendations"] = [
    { title: "Add dedicated service pages", description: "Build one focused page per core service with clear benefits and FAQs.", priority: "high" },
    { title: "Strengthen trust sitewide", description: "Place reviews, badges, and proof near every primary CTA.", priority: "medium" },
    { title: "Improve AI Search Readiness", description: "Use structured headings, direct answers, and clear service-area coverage.", priority: "medium" },
  ];

  return [...mapped, ...defaults].slice(0, 6);
}
