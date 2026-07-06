// lib/validate.mjs
//
// Shared, audited input-handling helpers used by every API route. Two
// concerns, kept in one small file so there's a single place to review:
//
//
// 2) XSS via attributes — React auto-escapes TEXT content, but does NOT
//    validate `href`/`src` attribute VALUES. Content scraped from
//    external sites (scripts/scrapeNews.mjs) is untrusted input: if a
//    compromised or malicious source ever returns a `link`/`image` field
//    like "javascript:alert(document.cookie)", rendering it directly as
//    <a href={link}> would execute it when clicked. RULE: every
//    externally-sourced URL must pass isSafeUrl() before being stored or
//    served — this file's `sanitizeUrl()` is the single enforcement point.

/** Coerces a value to a positive integer within [1, max], defaulting otherwise. */
export function toPositiveInt(value, { def, max }) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(n, max);
}

/** Coerces a value to a strict boolean — only the literal string "true" counts. */
export function toStrictBool(value) {
  return value === 'true';
}

/**
 * Returns true only for http:// and https:// URLs. Rejects javascript:,
 * data:, vbscript:, file:, and anything malformed — these are the schemes
 * commonly used for attribute-based XSS (e.g. <a href="javascript:...">
 * or <img src="data:text/html,...">, which some browsers still execute
 * in certain contexts).
 */
export function isSafeUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false; // not a parseable absolute URL at all
  }
}

/** Returns the URL if safe, otherwise null — use this when writing the field. */
export function sanitizeUrl(value) {
  return isSafeUrl(value) ? value : null;
}

/**
 * Applies sanitizeUrl() to every named top-level field in `urlFields` on
 * an item before it's ever returned to the client. Use this for flat
 * schemas (e.g. news_feed items: `link`, `image`). For nested structures
 * (event.tickets.official_page etc.), use deepStripDangerousSchemes
 * instead — see below.
 */
export function sanitizeItemUrls(item, urlFields) {
  const clean = { ...item };
  for (const field of urlFields) {
    if (field in clean) clean[field] = sanitizeUrl(clean[field]);
  }
  return clean;
}

/**
 * Recursively walks any value (object, array, or primitive) and replaces
 * any string that starts with a dangerous URL scheme (javascript:, data:,
 * vbscript:) with null. Unlike sanitizeItemUrls (which only checks named
 * top-level fields), this catches nested structures too — e.g. an
 * event's `tickets.official_page` or `venue.map_url`, which come from
 * imported/resolved series data (see api/events.js's enrichWithSeriesRefs)
 * and could be several levels deep depending on the source JSON's shape.
 * Safe to run on an entire API response as a final blanket pass: ordinary
 * text (titles, descriptions) essentially never starts with these
 * schemes, so false positives are negligible.
 */
const DANGEROUS_SCHEME = /^\s*(javascript|data|vbscript):/i;

export function deepStripDangerousSchemes(value) {
  if (typeof value === 'string') {
    return DANGEROUS_SCHEME.test(value) ? null : value;
  }
  if (Array.isArray(value)) {
    return value.map(deepStripDangerousSchemes);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      clean[key] = deepStripDangerousSchemes(val);
    }
    return clean;
  }
  return value;
}
