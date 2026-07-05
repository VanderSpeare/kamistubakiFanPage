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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  try {
    const news = await getNewsCollection();

    // Sorting by the string date "YYYY.MM.DD" works fine lexicographically
    // since it's zero-padded, so newest-first sort doesn't need a real
    // Date field. Fine for a news feed; switch to a proper Date type if
    // you later need range queries (e.g. "events in the next 30 days").
    const items = await news
      .find({}, { projection: { _id: 0 } })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();

    // Cache at the edge/CDN for 10 minutes — this data only changes when
    // the weekly scraper runs, so there's no need to hit Mongo on every
    // single page load.
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
