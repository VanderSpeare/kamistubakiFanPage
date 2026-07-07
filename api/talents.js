// api/talents.js
//
// GET /api/talents → [{ id, name, youtube }, ...]
//
// Reads the `talents` collection (imported via importKnowledgeBase.mjs),
// exposing only what the frontend actually needs: name + a YouTube
// channel link. Talents with no usable YouTube URL in their `social`
// field are filtered out — nothing to link to otherwise.
import { getDb } from '../lib/mongo.mjs';
import { deepStripDangerousSchemes } from '../lib/validate.mjs';

function extractYouTubeUrl(talent) {
  const social = talent.social || {};
  const entry = Object.entries(social).find(
    ([key, value]) => key.toLowerCase().includes('youtube') && typeof value === 'string' && value.startsWith('http')
  );
  return entry ? entry[1] : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const talents = await db
      .collection('talents')
      .find({}, { projection: { _id: 1, name: 1, social: 1 } })
      .toArray();

    const list = talents
      .map((t) => ({ id: t._id, name: t.name, youtube: extractYouTubeUrl(t) }))
      .filter((t) => t.name && t.youtube);

    const safe = deepStripDangerousSchemes(list);

    // Talent roster/social links change rarely — cache longer than the
    // news/events feeds.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(safe);
  } catch (err) {
    console.error('[api/talents] Failed to fetch talents:', err);
    return res.status(500).json({ error: 'Failed to fetch talents' });
  }
}