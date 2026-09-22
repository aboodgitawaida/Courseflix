const STORAGE_KEY = "courseflix-attribution";
const MAX_VALUE_LENGTH = 160;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  referrer?: string;
  landingPath?: string;
  firstVisitAt?: string;
};

function cleanValue(value: string | null) {
  if (!value) return undefined;
  const cleaned = [...value]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    })
    .join("")
    .trim()
    .slice(0, MAX_VALUE_LENGTH);
  return cleaned || undefined;
}

function getReferrer() {
  if (!document.referrer) return undefined;

  try {
    const url = new URL(document.referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return cleanValue(`${url.origin}${url.pathname}`);
  } catch {
    return undefined;
  }
}

export function captureFirstTouchAttribution() {
  if (typeof window === "undefined") return;

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const params = new URLSearchParams(window.location.search);
  const attribution: Attribution = {
    landingPath: cleanValue(window.location.pathname),
    referrer: getReferrer(),
    firstVisitAt: new Date().toISOString(),
  };

  for (const key of UTM_KEYS) {
    const value = cleanValue(params.get(key));
    if (value) attribution[key] = value;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
}

export function getStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Attribution;
  } catch {
    return null;
  }
}
