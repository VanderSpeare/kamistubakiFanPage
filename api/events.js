// api/events.js
//
// GET /api/events              → upcoming announced events, soonest first
// GET /api/events?limit=10     → cap the number returned
// GET /api/events?all=true     → skip the upcoming-only filter (debug/admin use)
//
// Reads the structured `events` collection (imported via
// scripts/importKnowledgeBase.mjs) — NOT `news_feed` (that's the
// scraper's announcement stream, see api/news.js). This endpoint answers
// "what's actually happening and when", using each event's real `date`
// and `status` fields rather than when it was announced.
//
// Some events don't carry their own `venue`/`tickets_ref`/`goods_ref` —
// multi-night series (e.g. KAMITSUBAKI WARS) store that once on the
// `series` document and each event just points at it via a string like
// "series_2026_kamitsubaki_wars.venue". This handler resolves those
// pointers so the frontend always gets a usable `venue` object and
// ticket/goods info, regardless of whether it came from the event
// itself or its parent series.
import { getDb } from '../lib/mongo.mjs';
import { toPositiveInt, toStrictBool, deepStripDangerousSchemes } from '../lib/validate.mjs';

/** Reads a dotted path ("tickets_general.official_page") off an object. */
function getPath(obj, dottedPath) {
  return dottedPath.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

/**
 * Resolves a "{seriesId}.{field}" reference string against a map of
 * already-fetched series documents. Returns undefined if the series or
 * field isn't found — callers should fall back gracefully.
 */
function resolveRef(ref, seriesById) {
  if (typeof ref !== 'string' || !ref.includes('.')) return undefined;
  const [seriesId, ...rest] = ref.split('.');
  const series = seriesById.get(seriesId);
  if (!series) return undefined;
  return getPath(series, rest.join('.'));
}

async function enrichWithSeriesRefs(db, events) {
  const seriesIds = [
    ...new Set(
      events
        .flatMap((e) => [e.venue_ref, e.tickets_ref, e.goods_ref, e.series_id])
        .filter(Boolean)
        .map((ref) => ref.split('.')[0])
    ),
  ];

  if (seriesIds.length === 0) return events;

  const seriesDocs = await db
    .collection('series')
    .find({ _id: { $in: seriesIds } })
    .toArray();
  const seriesById = new Map(seriesDocs.map((s) => [s._id, s]));

  return events.map((e) => ({
    ...e,
    venue: e.venue ?? resolveRef(e.venue_ref, seriesById) ?? null,
    tickets: e.tickets ?? resolveRef(e.tickets_ref, seriesById) ?? null,
    goods: e.goods ?? resolveRef(e.goods_ref, seriesById) ?? null,
    seriesTitle: e.series_id ? seriesById.get(e.series_id)?.title ?? null : null,
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = toPositiveInt(req.query.limit, { def: 20, max: 50 });
  const includeAll = toStrictBool(req.query.all);

  try {
    const db = await getDb();
    const events = db.collection('events');

    // `date` in the source data is a plain string, and NOT always a full
    // ISO date — some entries are "TBA", a bare year ("2022"), or a
    // partial month ("2024-01"). Only a strict "YYYY-MM-DD" string can be
    // safely compared lexicographically against today's date, so that's
    // the only shape we treat as a real, orderable date here. Anything
    // looser (TBA, year-only, etc.) genuinely isn't a fixed date yet, so
    // excluding it from "upcoming" is correct, not a parsing shortcut.
    const todayIso = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

    const query = includeAll
      ? {}
      : {
          status: 'Announced',
          date: { $regex: isoDatePattern, $gte: todayIso },
        };

    const items = await events
      .find(query, { projection: { _id: 0 } })
      .sort({ date: 1 }) // ascending — soonest event first
      .limit(limit)
      .toArray();

    // Belt-and-suspenders: Mongo's $regex + $gte together on a string
    // field behaves correctly here since both operators apply to the
    // same string type, but we double-check in application code too,
    // in case the collection ever picks up a non-string `date` value.
    const upcoming = includeAll
      ? items
      : items.filter((e) => typeof e.date === 'string' && isoDatePattern.test(e.date) && e.date >= todayIso);

    const enriched = await enrichWithSeriesRefs(db, upcoming);

    // XSS defense: venue/tickets/goods came from imported knowledge-base
    // data and series-ref resolution — nested objects, so the flat
    // sanitizeItemUrls() from api/news.js doesn't reach them. This walks
    // the whole structure and neutralizes any javascript:/data: scheme
    // wherever it's hiding.
    const safe = deepStripDangerousSchemes(enriched);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(safe);
  } catch (err) {
    console.error('[api/events] Failed to fetch events:', err);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
}

/**
 * NOT ON VERCEL? Same Express adaptation as api/news.js:
 *
 *   import eventsHandler from './api/events.js';
 *   app.get('/api/events', (req, res) => eventsHandler(req, res));
 */
