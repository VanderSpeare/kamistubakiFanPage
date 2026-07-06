// api/refresh-news.js
//
// POST /api/refresh-news
//
// Triggers scripts/scrapeNews.mjs's runScrape() on demand (instead of only
// waiting for the daily GitHub Actions cron) and reports what happened.
// This is what the frontend's "Refresh" button calls before re-fetching
// /api/news.
//
// IMPORTANT — this launches a real headless browser (Playwright) and hits
// several external sources, so it commonly takes 15-40+ seconds. That's
// fine on a self-hosted Node/Express server (matches how you're already
// running test-server.mjs), but WILL NOT work as-is on Vercel serverless
// functions (10s timeout on the free tier, and Chromium isn't
// pre-installed there) — if you deploy there later, you'd need
// @sparticuz/chromium-min and a background job/queue instead of a
// synchronous request. Flagging this now so it isn't a surprise later.
//
// AUTH MODEL — two tiers, because this endpoint has two kinds of callers:
//
// 1) TRUSTED callers (GitHub Actions cron, an admin script) — send
//    header `x-refresh-token: <REFRESH_SECRET>`. These bypass rate
//    limiting entirely.
// 2) PUBLIC callers (a visitor clicking "Refresh" on the landing page) —
//    have NO way to hold a secret safely, since anything sent from
//    browser JS is visible in DevTools → Network and can be copied and
//    replayed by anyone, forever. So public calls are NOT secret-gated —
//    they're rate-limited per IP instead. This is the honest tradeoff:
//    a public trigger button can only ever be throttled, not "secured"
//    with a static token.
import { runScrape } from '../scripts/scrapeNews.mjs';

let isScraping = false;

// In-memory rate limit: 1 public-triggered scrape per IP per 10 minutes.
// Resets on server restart and doesn't share state across multiple
// instances — fine for a single-process deployment; swap for a
// Mongo/Redis-backed counter if you ever run multiple instances behind a
// load balancer.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const lastRequestByIp = new Map();

function isRateLimited(ip) {
  const last = lastRequestByIp.get(ip);
  const now = Date.now();
  if (last && now - last < RATE_LIMIT_WINDOW_MS) return true;
  lastRequestByIp.set(ip, now);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expectedSecret = process.env.REFRESH_SECRET;
  const isTrustedCaller = expectedSecret && req.headers['x-refresh-token'] === expectedSecret;

  if (!isTrustedCaller) {
    // Public call — apply the rate limit instead of pretending a secret
    // protects this path.
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests — please wait before refreshing again' });
    }
  }

  if (isScraping) {
    return res.status(429).json({ error: 'A scrape is already in progress — try again shortly' });
  }

  isScraping = true;
  try {
    const summary = await runScrape();
    return res.status(200).json(summary);
  } catch (err) {
    console.error('[api/refresh-news] Scrape failed:', err);
    return res.status(500).json({ error: 'Scrape failed', message: err.message });
  } finally {
    isScraping = false;
  }
}
