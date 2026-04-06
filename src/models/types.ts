export type PageType =
  | "homepage"
  | "service"
  | "location"
  | "about"
  | "contact"
  | "faq"
  | "review"
  | "gallery"
  | "other";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface ExtractedPage {
  url: string;
  pageType: PageType;
  title: string;
  metaDescription: string;
  canonical?: string;
  robots?: string;
  h1: string[];
  h2: string[];
  h3: string[];
  wordCount: number;
  visibleText: string;
  internalLinks: string[];
  navLinks: string[];
  footerLinks: string[];
  contactLinks: string[];
  clickToCallLinks: string[];
  formLinks: string[];
  bookingLinks: string[];
  signals: {
    hasForm: boolean;
    hasQuotePath: boolean;
    hasClickToCall: boolean;
    hasContactSection: boolean;
    hasReviews: boolean;
    hasTrustBadges: boolean;
    hasFinancing: boolean;
    hasBookingButton: boolean;
    hasServiceAreas: boolean;
    hasFaqContent: boolean;
    hasChatWidget: boolean;
    hasGallerySignal: boolean;
  };
  media: {
    imageCount: number;
    withAltCount: number;
  };
  schema: {
    hasJsonLd: boolean;
    hasLocalBusiness: boolean;
    hasFaq: boolean;
    hasReview: boolean;
    hasService: boolean;
  };
  keywordSignals: {
    serviceKeywords: number;
    locationKeywords: number;
    trustKeywords: number;
    ctaKeywords: number;
  };
}

export interface ScanReport {
  id: string;
  submittedUrl: string;
  normalizedUrl: string;
  scannedAt: string;
  siteSummary: {
    pagesScanned: number;
    primaryIndustry: string;
    confidenceLevel: ConfidenceLevel;
  };
  screenshots: {
    mobileHomepage?: string;
    desktopHomepage?: string;
  };
  scores: {
    overall: number;
    design: number;
    seo: number;
    conversion: number;
    aiReadiness: number;
  };
  subScores: {
    aiReadiness: {
      contentClarity: number;
      serviceLocationStructure: number;
      trustAuthority: number;
      aiFriendlyAnswers: number;
      technicalStructure: number;
    };
  };
  revenueOpportunity: {
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
  };
  topIssues: Array<{
    category: "design" | "seo" | "conversion" | "ai";
    title: string;
    explanation: string;
    impact: string;
    recommendedFix: string;
    severity: "low" | "medium" | "high";
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
  }>;
  pageFindings: Array<{
    url: string;
    pageType: PageType;
    title: string;
    wordCount: number;
    issues: string[];
    scoreHints: {
      design: number;
      seo: number;
      conversion: number;
      ai: number;
    };
  }>;
  lockedSummary: {
    issuesFound: number;
    teaser: string[];
  };
}

export interface LeadData {
  reportId: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  city: string;
  monthlyBudget?: string;
  createdAt: string;
}
