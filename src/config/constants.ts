export const CRAWL_LIMITS = {
  maxPages: 10,
  maxDepth: 2,
  timeoutMs: 10000,
};

export const PAGE_PRIORITY_KEYWORDS = [
  "service",
  "services",
  "about",
  "contact",
  "faq",
  "review",
  "testimonial",
  "areas",
  "locations",
  "cities",
  "estimate",
  "quote",
  "financing",
  "emergency",
];

export const IGNORE_PATH_KEYWORDS = [
  "wp-admin",
  "cart",
  "checkout",
  "login",
  "account",
  "privacy-policy",
];

export const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  Roofing: ["roof", "roofing", "shingle", "metal roof"],
  HVAC: ["hvac", "ac", "air conditioning", "heating", "furnace"],
  Plumbing: ["plumbing", "plumber", "drain", "water heater"],
  Electrical: ["electrical", "electrician", "panel", "rewire"],
  "Pressure Washing": ["pressure washing", "power washing", "soft wash"],
  Landscaping: ["landscaping", "lawn", "irrigation", "sod"],
  Fencing: ["fencing", "fence", "privacy fence"],
  Remodeling: ["remodel", "renovation", "kitchen remodel", "bath remodel"],
  Concrete: ["concrete", "driveway", "foundation slab", "stamped concrete"],
  "Junk Removal": ["junk removal", "hauling", "debris"],
  Cleaning: ["house cleaning", "maid", "cleaning service"],
  "Foundation Repair": ["foundation repair", "pier and beam", "slab repair"],
  "Pest Control": ["pest control", "termite", "rodent"],
  "Pool Services": ["pool service", "pool cleaning", "pool repair"],
};

export const DEFAULT_JOB_VALUES: Record<string, number> = {
  Roofing: 10000,
  HVAC: 6000,
  Plumbing: 600,
  Electrical: 800,
  "Pressure Washing": 300,
  Landscaping: 2000,
  Fencing: 4000,
  Remodeling: 15000,
  Concrete: 6000,
  "Junk Removal": 300,
  Cleaning: 200,
  "Foundation Repair": 12000,
  "Pest Control": 250,
  "Pool Services": 500,
  "General Home Services": 500,
};

export const SIGNAL_KEYWORDS = {
  trust: ["licensed", "insured", "certified", "award", "years in business", "5-star", "testimonial"],
  cta: ["call now", "get quote", "free estimate", "book now", "contact us", "schedule service"],
  location: ["texas", "tx", "near me", "service area", "city", "county"],
  faq: ["faq", "frequently asked", "how much", "how long", "what to expect"],
  financing: ["financing", "payment plan", "monthly payment"],
  review: ["review", "testimonial", "what customers say"],
  chatbot: ["chat", "intercom", "drift", "tawk", "livechat", "chatbot"],
};
