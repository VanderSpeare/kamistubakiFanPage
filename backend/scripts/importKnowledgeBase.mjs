#!/usr/bin/env node
/**
 * scripts/importKnowledgeBase.mjs
 *
 * Reads the hand-curated knowledge-base JSON (studio info, talents,
 * anime project, series, events/releases, meta) and upserts each section
 * into its own MongoDB collection:
 *
 *   studio         → 1 document  (singleton, _id: 'main')
 *   talents        → 1 document per talent (_id: talent.id)
 *   anime_project  → 1 document  (singleton, _id: 'main')
 *   series         → 1 document per series (_id: series.id)
 *   events         → 1 document per event/release (_id: event.id)
 *   meta           → 1 document  (singleton, _id: 'main')
 *
 * This is DELIBERATELY a different collection ("events") from the
 * scraper's output ("news_feed" — see lib/mongo.mjs). The scraper writes
 * a flat announcement feed; this script writes the structured, dated,
 * source-verified event data meant to answer "what's actually happening
 * and when" — use `events` for the landing page's upcoming-events logic,
 * and `news_feed` for the general NEWS section.
 *
 * SETUP: no extra deps beyond what's already installed (mongodb).
 *
 * USAGE:
 *   node --env-file=.env scripts/importKnowledgeBase.mjs [path-to-json]
 *
 *   Defaults to backend/data/kamitsubaki_cleaned.json if no path is given.
 *   Re-running is safe — every write is an upsert keyed by id, so running
 *   this again after editing the JSON just updates existing documents
 *   (no duplicates).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { getDb } from '../lib/mongo.mjs';

const DEFAULT_INPUT_PATH = path.resolve('data/kamitsubaki_cleaned.json');

async function loadKnowledgeBase(inputPath) {
  let raw;
  try {
    raw = await fs.readFile(inputPath, 'utf-8');
  } catch (err) {
    throw new Error(
      `Could not read ${inputPath} — place the JSON file there, or pass ` +
      `a path: node --env-file=.env scripts/importKnowledgeBase.mjs path/to/file.json\n` +
      `(${err.message})`
    );
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse ${inputPath} as JSON: ${err.message}`);
  }
}

/** Upserts a single singleton document (studio, anime_project, meta). */
async function upsertSingleton(db, collectionName, doc) {
  if (!doc) {
    console.log(`[importKB] Skipping "${collectionName}" — not present in source JSON`);
    return 0;
  }
  await db.collection(collectionName).updateOne(
    { _id: 'main' },
    { $set: { ...doc, _id: 'main', importedAt: new Date() } },
    { upsert: true }
  );
  return 1;
}

/** Upserts an array of documents, each keyed by its own `id` field. */
async function upsertById(db, collectionName, items) {
  if (!Array.isArray(items) || items.length === 0) {
    console.log(`[importKB] Skipping "${collectionName}" — no items in source JSON`);
    return 0;
  }

  const collection = db.collection(collectionName);
  let count = 0;

  for (const item of items) {
    if (!item.id) {
      console.warn(`[importKB] Skipping an item in "${collectionName}" with no "id" field:`, item.title ?? item.name ?? item);
      continue;
    }

    await collection.updateOne(
      { _id: item.id },
      { $set: { ...item, _id: item.id, importedAt: new Date() } },
      { upsert: true }
    );
    count++;
  }

  return count;
}

async function main() {
  const inputPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : DEFAULT_INPUT_PATH;

  console.log(`[importKB] Reading ${inputPath}`);
  const data = await loadKnowledgeBase(inputPath);

  const db = await getDb();
  console.log(`[importKB] Connected to database "${db.databaseName}"`);

  const studioCount = await upsertSingleton(db, 'studio', data.studio);
  const talentsCount = await upsertById(db, 'talents', data.talents);
  const animeCount = await upsertSingleton(db, 'anime_project', data.anime_project);
  const seriesCount = await upsertById(db, 'series', data.series);
  const eventsCount = await upsertById(db, 'events', data.events);
  const metaCount = await upsertSingleton(db, 'meta', data.meta);

  console.log('[importKB] Done:');
  console.log(`  studio:        ${studioCount} document`);
  console.log(`  talents:       ${talentsCount} documents`);
  console.log(`  anime_project: ${animeCount} document`);
  console.log(`  series:        ${seriesCount} documents`);
  console.log(`  events:        ${eventsCount} documents`);
  console.log(`  meta:          ${metaCount} document`);

  process.exit(0);
}

main().catch((err) => {
  console.error('[importKB] Fatal error:', err.message);
  process.exit(1);
});
