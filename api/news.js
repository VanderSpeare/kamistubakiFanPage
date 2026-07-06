// api/news.js
//
// Serverless API route (Vercel convention: files under /api become
// endpoints automatically — deploy as-is if you're on Vercel; see the
// note at the bottom for adapting this to Express/other hosts instead).
//
// GET /api/news              → latest 20 items, newest first
// GET /api/news?limit=6      → latest 6 items
//
// The frontend never talks to MongoDB directly — credentials stay
// server-side, which is why this endpoint exists instead of having
// NewsSection.jsx query Mongo itself.
import { getNewsCollection } from '../lib/mongo.mjs';
import { toPositiveInt, sanitizeItemUrls } from '../lib/validate.mjs';

/**
 * Normalizes a title into a comparable "fingerprint": lowercase, strip
 * punctuation/whitespace, keep the first 40 chars. Two items covering the
 * same real-world announcement (e.g. official news page + a YouTube
 * upload title + a Google News headline) usually share enough of their
 * opening words to collide here, even with different exact wording and
 * definitely different `link`s (which is why Mongo's own link-based dedup
 * doesn't catch this case).
 */
function titleFingerprint(title) {
  return title
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '') // strip punctuation/whitespace/symbols, Unicode-aware
    .slice(0, 40);
}

/**
 * Selects one item per fingerprint out of items already sorted
 * newest-first. Keeps the first (= newest) occurrence of each
 * fingerprint, so near-duplicate coverage of the same announcement
 * collapses to a single card instead of 2-3 repeats in the feed.
 */
function dedupeByContent(items) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const fingerprint = titleFingerprint(item.title);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    result.push(item);
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // toPositiveInt never lets req.query.limit reach Mongo as anything but
  // a bounded plain number — a crafted query string (e.g. ?limit[$ne]=1)
  // can't turn into an object that reaches a filter/option here.
  const limit = toPositiveInt(req.query.limit, { def: 20, max: 50 });

  try {
    const news = await getNewsCollection();

    // Sorting by the string date "YYYY.MM.DD" works fine lexicographically
    // since it's zero-padded, so newest-first sort doesn't need a real
    // Date field. Fine for a news feed; switch to a proper Date type if
    // you later need range queries (e.g. "events in the next 30 days").
    //
    // Fetch more than `limit` before deduping — some will collapse into
    // each other, so asking Mongo for exactly `limit` up front would
    // under-fill the response after dedup.
    const rawItems = await news
      .find({}, { projection: { _id: 0 } })
      .sort({ date: -1 })
      .limit(limit * 3)
      .toArray();

    const deduped = dedupeByContent(rawItems).slice(0, limit);

    // XSS defense: `link`/`image` came from external, untrusted sources
    // (scraped HTML/RSS). Strip anything that isn't a plain http(s) URL
    // before this ever reaches the browser — see lib/validate.mjs.
    const items = deduped.map((item) => sanitizeItemUrls(item, ['link', 'image']));

    // Cache at the edge/CDN for 10 minutes — this data only changes when
    // the scraper runs, so there's no need to hit Mongo on every single
    // page load.
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(items);
  } catch (err) {
    console.error('[api/news] Failed to fetch events:', err);
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
}

/**
 * NOT ON VERCEL? Adapt this to Express in a few lines:
 *
 *   import express from 'express';
 *   import newsHandler from './api/news.js';
 *   const app = express();
 *   app.get('/api/news', (req, res) => newsHandler(req, res));
 *
 * The handler function signature (req, res) is intentionally
 * Express-compatible so this works either way with no rewrite.
 */
