export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Please enter a website URL.");

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("Invalid URL format. Please check and try again.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  url.hostname = url.hostname.replace(/^www\./i, "").toLowerCase();

  return url.toString();
}

export function isSameDomain(base: string, target: string): boolean {
  try {
    const b = new URL(base);
    const t = new URL(target);
    return b.hostname.replace(/^www\./, "") === t.hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
}

export function cleanCrawlUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  if (rawUrl.startsWith("mailto:") || rawUrl.startsWith("tel:") || rawUrl.startsWith("#")) return null;
  if (/\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|docx?)$/i.test(rawUrl)) return null;

  try {
    const parsed = new URL(rawUrl);
    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_)/i.test(key)) {
        parsed.searchParams.delete(key);
      }
    }
    if (!parsed.searchParams.toString()) parsed.search = "";
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return null;
  }
}
