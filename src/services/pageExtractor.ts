import * as cheerio from "cheerio";
import { SIGNAL_KEYWORDS } from "../config/constants.js";
import type { ExtractedPage, PageType } from "../models/types.js";
import type { CrawledRawPage } from "./crawler.js";

function textIncludesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function countKeywords(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  return terms.reduce((acc, term) => acc + (lower.includes(term) ? 1 : 0), 0);
}

function classifyPage(url: string, title: string, h1: string[]): PageType {
  const key = `${url} ${title} ${h1.join(" ")}`.toLowerCase();
  if (/\/$/.test(url) || key.includes("home")) return "homepage";
  if (/(service|repair|install|replacement)/.test(key)) return "service";
  if (/(area|location|city)/.test(key)) return "location";
  if (/(about|team|company)/.test(key)) return "about";
  if (/(contact|get in touch)/.test(key)) return "contact";
  if (/(faq|question)/.test(key)) return "faq";
  if (/(review|testimonial)/.test(key)) return "review";
  if (/(gallery|project|portfolio)/.test(key)) return "gallery";
  return "other";
}

export function extractPage(raw: CrawledRawPage): ExtractedPage {
  const $ = cheerio.load(raw.html);
  $("script,style,noscript,svg").remove();

  const title = ($("title").first().text() || "").trim();
  const metaDescription = ($("meta[name='description']").attr("content") || "").trim();
  const canonical = $("link[rel='canonical']").attr("href");
  const robots = $("meta[name='robots']").attr("content");

  const h1 = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h2 = $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h3 = $("h3").map((_, el) => $(el).text().trim()).get().filter(Boolean);

  const visibleText = $("body").text().replace(/\s+/g, " ").trim();
  const words = visibleText.split(/\s+/).filter(Boolean);

  const internalLinks = $("a[href]").map((_, el) => $(el).attr("href") || "").get();
  const navLinks = $("nav a[href]").map((_, el) => $(el).attr("href") || "").get();
  const footerLinks = $("footer a[href]").map((_, el) => $(el).attr("href") || "").get();

  const contactLinks = internalLinks.filter((x) => /contact|quote|estimate/i.test(x));
  const clickToCallLinks = internalLinks.filter((x) => /^tel:/i.test(x));
  const formLinks = internalLinks.filter((x) => /form|contact|quote|estimate/i.test(x));
  const bookingLinks = internalLinks.filter((x) => /book|schedule|appointment/i.test(x));

  const imgEls = $("img");
  const imageCount = imgEls.length;
  const withAltCount = imgEls.filter((_, el) => !!$(el).attr("alt")?.trim()).length;

  const scripts = $("script").map((_, el) => `${$(el).attr("src") || ""} ${$(el).html() || ""}`).get().join(" ").toLowerCase();
  const fullText = `${title} ${metaDescription} ${visibleText}`;

  const jsonLd = $("script[type='application/ld+json']").map((_, el) => $(el).html() || "").get().join(" ").toLowerCase();

  return {
    url: raw.url,
    pageType: classifyPage(raw.url, title, h1),
    title,
    metaDescription,
    canonical,
    robots,
    h1,
    h2,
    h3,
    wordCount: words.length,
    visibleText,
    internalLinks,
    navLinks,
    footerLinks,
    contactLinks,
    clickToCallLinks,
    formLinks,
    bookingLinks,
    signals: {
      hasForm: $("form").length > 0,
      hasQuotePath: textIncludesAny(fullText, ["quote", "estimate"]),
      hasClickToCall: clickToCallLinks.length > 0 || /call now/i.test(fullText),
      hasContactSection: $("section,div").filter((_, el) => /contact|get in touch/i.test($(el).text())).length > 0,
      hasReviews: textIncludesAny(fullText, SIGNAL_KEYWORDS.review),
      hasTrustBadges: textIncludesAny(fullText, SIGNAL_KEYWORDS.trust),
      hasFinancing: textIncludesAny(fullText, SIGNAL_KEYWORDS.financing),
      hasBookingButton: bookingLinks.length > 0,
      hasServiceAreas: /service area|cities we serve|areas we serve/i.test(fullText),
      hasFaqContent: /\?/.test(h2.join(" ")) || textIncludesAny(fullText, SIGNAL_KEYWORDS.faq),
      hasChatWidget: textIncludesAny(scripts, SIGNAL_KEYWORDS.chatbot),
      hasGallerySignal: /gallery|project|before and after/i.test(fullText),
    },
    media: {
      imageCount,
      withAltCount,
    },
    schema: {
      hasJsonLd: !!jsonLd,
      hasLocalBusiness: jsonLd.includes("localbusiness"),
      hasFaq: jsonLd.includes("faqpage"),
      hasReview: jsonLd.includes("review"),
      hasService: jsonLd.includes("service"),
    },
    keywordSignals: {
      serviceKeywords: countKeywords(fullText, ["service", "repair", "install", "replacement", "emergency"]),
      locationKeywords: countKeywords(fullText, SIGNAL_KEYWORDS.location),
      trustKeywords: countKeywords(fullText, SIGNAL_KEYWORDS.trust),
      ctaKeywords: countKeywords(fullText, SIGNAL_KEYWORDS.cta),
    },
  };
}
