#!/usr/bin/env node
/**
 * scripts/scrapeNews.mjs  (v3 — multi-source + MongoDB)
 *
 * Pulls announcements/events from every FREE source available and upserts
 * them into MongoDB's `news_feed` collection (deduplicated by `link`),
 * instead of writing a local news.json. api/news.js then serves this to
 * the frontend.
 *
 * NOTE: this is separate from the structured knowledge-base data (talents,
 * series, real event dates/venues) imported via scripts/importKnowledgeBase.mjs
 * into the `events` collection. Different schema, different collection,
 * on purpose — see lib/mongo.mjs for why.
 *
 * SOURCES (all free, no paid API required):
 *   1. https://kamitsubaki.studio/en/news/  — the label's own official
 *      news page. Covers ALL artists/units in one place, paginated,
 *      stable structure. This is the primary/most complete source.
 *   2. YouTube RSS feed for the official channel — free, no API key,
 *      no quota. Catches video drops (MVs, streams, announcements).
 *   3. YouTube RSS feeds for EACH individual talent's own channel —
 *      auto-discovered from the `talents` collection (imported via
 *      importKnowledgeBase.mjs). This is what catches things the main
 *      official channel doesn't repost, e.g. a member's own upload.
 *      NOTE: this still only sees YOUTUBE VIDEOS, not "Community tab"
 *      posts or X/Twitter posts — YouTube's public RSS feed genuinely
 *      does not include Community posts (a platform limitation, not a
 *      bug here), and X requires the paid API (source #6 below).
 *   4. Google News RSS search — free, no API key. Catches press coverage
 *      that the official channels may not repost themselves.
 *   5. Event microsites (yokohamawars2026/kaf, /vwp) — free via
 *      Playwright, for ticket/venue-specific info not on the main feed.
 *   6. (OPTIONAL, NOT FREE) X API v2 — see the commented-out source
 *      below. Only enable if you've accepted the pay-per-use cost. This
 *      is the only way to reliably catch X-only announcements (e.g. a
 *      member's own tweet that never gets reposted anywhere else).
 *
 * SETUP:
 *   npm install mongodb playwright cheerio fast-xml-parser
 *   npx playwright install --with-deps chromium
 *
 * ENV:
 *   MONGODB_URI=mongodb+srv://...        (required)
 *   MONGODB_DB=kamitsubaki_fansite       (optional, see lib/mongo.mjs)
 *   X_BEARER_TOKEN=...                   (optional, only for the X source)
 *
 * RUN:
 *   node scripts/scrapeNews.mjs
 *
 * AUTOMATION: .github/workflows/scrape-news.yml runs this weekly (or
 * change the cron to run more often — daily is reasonable given this now
 * hits several sources).
 */

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import { getNewsCollection, getDb } from '../../lib/mongo.mjs';

// ---------------------------------------------------------------------------
// SOURCE CONFIG
// ---------------------------------------------------------------------------

const OFFICIAL_NEWS_PAGES = 3; // how many pages of kamitsubaki.studio/en/news/ to pull (≈10 items/page)
const YOUTUBE_CHANNEL_ID = 'UCAOhUv73jM5iCpOhuJOQzxA'; // confirmed official KAMITSUBAKI STUDIO channel
const GOOGLE_NEWS_QUERIES = ['KAMITSUBAKI STUDIO', 'KAF 花譜', 'V.W.P 神椿'];

const HTML_EVENT_SOURCES = [
  {
    id: 'kaf-yokohamawars2026',
    label: 'KAF — 5th ONE-MAN LIVE「宿声 / 深愛」',
    url: 'https://yokohamawars2026.kamitsubaki.jp/kaf',
    parser: parseYokohamaWars,
  },
  {
    id: 'vwp-yokohamawars2026',
    label: 'V.W.P — 4th ONE-MAN LIVE「現象Ⅳ-反転運命-」',
    url: 'https://yokohamawars2026.kamitsubaki.jp/vwp',
    parser: parseYokohamaWars,
  },
];

// OPTIONAL — official X API source (pay-per-use since Feb 2026, ~$0.005/read).
// const TWITTER_SOURCES = [
//   { id: 'kamitsubaki-x', label: 'KAMITSUBAKI STUDIO (X)', username: 'kamitsubaki_jp' },
// ];

// ---------------------------------------------------------------------------
// SOURCE 1 — Official news page (kamitsubaki.studio/en/news/)
// ---------------------------------------------------------------------------

async function scrapeOfficialNews(browser) {
  const items = [];
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (compatible; fan-site-news-bot/3.0)',
  });

  try {
    for (let p = 1; p <= OFFICIAL_NEWS_PAGES; p++) {
      const url = p === 1
        ? 'https://kamitsubaki.studio/en/news/'
        : `https://kamitsubaki.studio/en/news/page/${p}/`;

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      const html = await page.content();
      const $ = cheerio.load(html);

      // Each news item is a link to /en/news/YYYY/MM/DD/{id}/ followed by
      // a date and title. Match on the URL pattern rather than a fragile
      // class name, since that pattern is guaranteed by the site's own
      // permalink structure and won't change on a redesign.
      $('a[href*="/en/news/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || !/\/en\/news\/\d{4}\/\d{2}\/\d{2}\/\d+\/?$/.test(href)) return;

        const block = $(el).closest('li, article, div');
        const text = block.text().trim().replace(/\s+/g, ' ');
        const dateMatch = text.match(/(\d{4})\.(\d{2})\.(\d{2})/);
        if (!dateMatch) return;

        // Title is whatever text remains after stripping the leading date
        // and artist tags — best effort, may need refinement once you've
        // inspected the live rendered DOM.
        const title = text.replace(dateMatch[0], '').trim().slice(0, 200);
        if (!title) return;

        items.push({
          source: 'kamitsubaki-official-news',
          sourceLabel: 'KAMITSUBAKI STUDIO — Official News',
          date: `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`,
          title,
          link: new URL(href, url).href,
          image: null,
        });
      });
    }
  } catch (err) {
    console.error('[scrapeNews] Failed to scrape official news page:', err.message);
  } finally {
    await page.close();
  }

  return items;
}

// ---------------------------------------------------------------------------
// SOURCE 2 — YouTube RSS (free, official, no API key/quota)
// ---------------------------------------------------------------------------

async function scrapeYouTubeRss(channelId, label) {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const res = await fetch(feedUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml);
    const entries = parsed?.feed?.entry;
    if (!entries) return [];

    const list = Array.isArray(entries) ? entries : [entries];
    return list.map((entry) => ({
      source: `youtube-${channelId}`,
      sourceLabel: label,
      date: entry.published ? entry.published.slice(0, 10).replace(/-/g, '.') : '—',
      title: entry.title,
      link: entry.link?.['@_href'] ?? `https://www.youtube.com/watch?v=${entry['yt:videoId']}`,
      image: entry['media:group']?.['media:thumbnail']?.['@_url'] ?? null,
    }));
  } catch (err) {
    console.error(`[scrapeNews] Failed YouTube RSS for ${channelId}:`, err.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// SOURCE 3b — Per-talent YouTube RSS, auto-discovered from `talents`
// ---------------------------------------------------------------------------

/**
 * Given any YouTube URL (channel/UC..., @handle, or /c/CustomName), returns
 * the underlying channel ID (UC...). Direct /channel/UC... URLs are parsed
 * with no network call; @handle and /c/ URLs require one fetch, because
 * YouTube doesn't expose a handle→ID mapping any other free way. The
 * channel ID is embedded in the page's server-rendered HTML, so a plain
 * fetch (no Playwright/JS execution needed) is enough.
 */
async function resolveYouTubeChannelId(url) {
  const directMatch = url.match(/\/channel\/(UC[\w-]{10,})/);
  if (directMatch) return directMatch[1];

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; fan-site-news-bot/3.0)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const patterns = [
      /"channelId":"(UC[\w-]{10,})"/,
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{10,})"/,
      /<meta itemprop="channelId" content="(UC[\w-]{10,})"/,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }
    throw new Error('channel ID pattern not found in page HTML');
  } catch (err) {
    console.warn(`[scrapeNews] Could not resolve YouTube channel ID for ${url}: ${err.message}`);
    return null;
  }
}

/** Pulls every usable YouTube URL out of a talent document's `social` field. */
function extractYouTubeUrls(talent) {
  const social = talent.social || {};
  return Object.entries(social)
    .filter(([key, value]) => key.toLowerCase().includes('youtube') && typeof value === 'string' && value.startsWith('http'))
    .map(([, value]) => value);
}

/**
 * Reads the `talents` collection (imported via importKnowledgeBase.mjs)
 * and resolves each member's own YouTube channel(s) into scrape-able
 * {id, label, channelId} sources — this is what surfaces a member's own
 * uploads even when the main official channel doesn't repost them.
 */
async function discoverArtistYouTubeSources(db) {
  const talents = await db.collection('talents').find({}).toArray();
  const sources = [];

  for (const talent of talents) {
    const urls = extractYouTubeUrls(talent);
    for (const url of urls) {
      const channelId = await resolveYouTubeChannelId(url);
      if (!channelId) continue;
      sources.push({
        id: `youtube-${talent._id}`,
        label: `${talent.name} (YouTube)`,
        channelId,
      });
    }
  }

  console.log(`[scrapeNews] Discovered ${sources.length} artist YouTube channels from ${talents.length} talents`);
  return sources;
}

// ---------------------------------------------------------------------------
// SOURCE 4 — Google News RSS search (free, no API key)
// ---------------------------------------------------------------------------

async function scrapeGoogleNewsRss(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ja&gl=JP&ceid=JP:ja`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const list = Array.isArray(items) ? items : [items];
    return list.slice(0, 10).map((item) => ({
      source: 'google-news',
      sourceLabel: `Press coverage — "${query}"`,
      date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10).replace(/-/g, '.') : '—',
      title: item.title,
      link: item.link,
      image: null,
    }));
  } catch (err) {
    console.error(`[scrapeNews] Failed Google News RSS for "${query}":`, err.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// SOURCE 4 — Event microsites (Playwright, same approach as before)
// ---------------------------------------------------------------------------

function parseYokohamaWars($, sourceMeta) {
  const items = [];
  $('.news-list li, .p-news__item, [class*="news"] li').each((_, el) => {
    const $el = $(el);
    const dateRaw = $el.find('[class*="date"]').first().text().trim();
    const title = $el.find('[class*="title"], p').first().text().trim();
    const link = $el.find('a').attr('href');
    const image = $el.find('img').attr('src');
    if (!title) return;

    items.push({
      source: sourceMeta.id,
      sourceLabel: sourceMeta.label,
      date: normalizeDate(dateRaw),
      title,
      link: link ? new URL(link, sourceMeta.url).href : sourceMeta.url,
      image: image ? new URL(image, sourceMeta.url).href : null,
    });
  });
  return items;
}

function normalizeDate(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  }
  return raw || '—';
}

async function scrapeHtmlEventSource(browser, source) {
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (compatible; fan-site-news-bot/3.0)',
  });
  try {
    await page.goto(source.url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.waitForTimeout(1000);
    const html = await page.content();
    const $ = cheerio.load(html);
    return source.parser($, source);
  } catch (err) {
    console.error(`[scrapeNews] Failed to render ${source.id}:`, err.message);
    return [];
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

/**
 * Runs one full scrape across all sources and upserts results into
 * MongoDB. Returns a summary object instead of exiting the process —
 * this is what lets both the CLI (`node scripts/scrapeNews.mjs`) and the
 * HTTP refresh endpoint (api/refresh-news.js) share the exact same logic.
 */
export async function runScrape() {
  const browser = await chromium.launch();
  const results = [];

  try {
    results.push(await scrapeOfficialNews(browser));
    results.push(await scrapeYouTubeRss(YOUTUBE_CHANNEL_ID, 'KAMITSUBAKI STUDIO (YouTube)'));

    // Per-talent channels — catches uploads a member's own channel gets
    // that the main official channel doesn't repost (e.g. Isekaijoucho's
    // own videos). Requires the `talents` collection to already be
    // populated via scripts/importKnowledgeBase.mjs.
    const db = await getDb();
    const artistSources = await discoverArtistYouTubeSources(db);
    for (const source of artistSources) {
      results.push(await scrapeYouTubeRss(source.channelId, source.label));
    }

    for (const query of GOOGLE_NEWS_QUERIES) {
      results.push(await scrapeGoogleNewsRss(query));
    }

    for (const source of HTML_EVENT_SOURCES) {
      results.push(await scrapeHtmlEventSource(browser, source));
    }
  } finally {
    await browser.close();
  }

  const merged = results.flat().filter((item) => item.link && item.title);
  console.log(`[scrapeNews] Scraped ${merged.length} items across ${results.length} source batches`);

  // Debug aid: if a parser is broken (e.g. a pagination bug that scrapes
  // the same "featured" block on every page instead of real distinct
  // items), the same title will show up many times *within this single
  // run*, each with a slightly different link. That's a real bug signal
  // — a healthy run should have very few exact-title repeats. This only
  // warns, it doesn't change what gets upserted (Mongo dedups by link,
  // which is correct when items really are distinct).
  const titleCounts = new Map();
  for (const item of merged) {
    titleCounts.set(item.title, (titleCounts.get(item.title) || 0) + 1);
  }
  const duplicateWarnings = [];
  for (const [title, count] of titleCounts) {
    if (count >= 3) {
      const msg = `"${title}" appeared ${count} times in this run — likely a parser bug, not ${count} distinct announcements.`;
      console.warn(`[scrapeNews] ⚠ ${msg}`);
      duplicateWarnings.push(msg);
    }
  }

  const news = await getNewsCollection();
  let upserted = 0;

  for (const item of merged) {
    const res = await news.updateOne(
      { link: item.link }, // dedup key — same announcement scraped twice (e.g. official news + Google News) won't duplicate
      {
        $set: { ...item, scrapedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) upserted++;
  }

  console.log(`[scrapeNews] Upserted ${upserted} new items into MongoDB (${merged.length - upserted} already existed)`);

  return {
    scraped: merged.length,
    upserted,
    alreadyExisted: merged.length - upserted,
    duplicateWarnings,
  };
}

// Only run as a CLI script when invoked directly (`node scripts/scrapeNews.mjs`),
// not when imported by api/refresh-news.js.
if (import.meta.url === `file://${process.argv[1]}`) {
  runScrape()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[scrapeNews] Fatal error:', err);
      process.exit(1);
    });
}
