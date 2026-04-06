import * as cheerio from "cheerio";
import { CRAWL_LIMITS, IGNORE_PATH_KEYWORDS, PAGE_PRIORITY_KEYWORDS } from "../config/constants.js";
import { cleanCrawlUrl, isSameDomain } from "../utils/urlHandler.js";

export interface CrawledRawPage {
  url: string;
  html: string;
  depth: number;
}

function scorePriority(url: string): number {
  const lower = url.toLowerCase();
  return PAGE_PRIORITY_KEYWORDS.reduce((score, keyword) => score + (lower.includes(keyword) ? 2 : 0), 0);
}

export async function crawlSite(startUrl: string): Promise<CrawledRawPage[]> {
  const pages: CrawledRawPage[] = [];
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  const seen = new Set<string>();

  while (queue.length && pages.length < CRAWL_LIMITS.maxPages) {
    queue.sort((a, b) => scorePriority(b.url) - scorePriority(a.url));
    const current = queue.shift();
    if (!current || seen.has(current.url)) continue;
    seen.add(current.url);

    if (IGNORE_PATH_KEYWORDS.some((keyword) => current.url.toLowerCase().includes(keyword))) continue;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CRAWL_LIMITS.timeoutMs);
      const response = await fetch(current.url, {
        signal: controller.signal,
        headers: { "user-agent": "KeyCityRevenueLeakDetector/1.0" },
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) continue;
      const html = await response.text();
      const finalUrl = cleanCrawlUrl(response.url) ?? current.url;

      pages.push({ url: finalUrl, html, depth: current.depth });

      if (current.depth >= CRAWL_LIMITS.maxDepth) continue;

      const $ = cheerio.load(html);
      const links = $("a[href]")
        .map((_, el) => $(el).attr("href") || "")
        .get();

      for (const href of links) {
        try {
          const resolved = new URL(href, finalUrl).toString();
          const cleaned = cleanCrawlUrl(resolved);
          if (!cleaned) continue;
          if (!isSameDomain(startUrl, cleaned)) continue;
          if (seen.has(cleaned)) continue;
          queue.push({ url: cleaned, depth: current.depth + 1 });
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }

  return pages;
}
