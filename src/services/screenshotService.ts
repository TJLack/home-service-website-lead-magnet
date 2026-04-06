import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

export async function captureScreenshots(url: string, reportId: string): Promise<{ mobileHomepage?: string; desktopHomepage?: string }> {
  await mkdir(path.resolve("public/screenshots"), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    const result: { mobileHomepage?: string; desktopHomepage?: string } = {};

    try {
      await mobilePage.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      const mobilePath = `screenshots/${reportId}-mobile.png`;
      await mobilePage.screenshot({ path: path.resolve("public", mobilePath), fullPage: true });
      result.mobileHomepage = `/${mobilePath}`;
    } catch {
      // graceful degradation
    }

    try {
      await desktopPage.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      const desktopPath = `screenshots/${reportId}-desktop.png`;
      await desktopPage.screenshot({ path: path.resolve("public", desktopPath), fullPage: true });
      result.desktopHomepage = `/${desktopPath}`;
    } catch {
      // graceful degradation
    }

    return result;
  } finally {
    await browser.close();
  }
}
