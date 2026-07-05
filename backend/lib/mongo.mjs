// lib/mongo.mjs
//
// Shared MongoDB connection helper. Used by both scripts/scrapeNews.mjs
// (writes) and api/news.js (reads). Keeping one client factory means both
// sides agree on the database/collection name and connection handling.
import { MongoClient } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB || 'testgrounddatabase';

// The scraper writes announcement/news items here — a flat feed schema
// (title, date, link, source). This is DELIBERATELY separate from the
// "events" collection, which holds the structured knowledge-base data
// (talents, series, real event dates/venues/performers) imported via
// scripts/importKnowledgeBase.mjs. The two have incompatible schemas —
// keeping them in different collections avoids one overwriting/corrupting
// the other.
export const NEWS_COLLECTION = 'news_feed';

let cachedClient = null;

/**
 * Returns a connected MongoClient, reusing the connection across calls.
 * In serverless environments (Vercel, etc.) the module scope persists
 * across warm invocations, so this avoids reconnecting on every request —
 * important because Mongo connections are relatively slow to establish
 * and most serverless platforms cap concurrent connections.
 */
export async function getMongoClient() {
  if (cachedClient) return cachedClient;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getNewsCollection() {
  const client = await getMongoClient();
  return client.db(DB_NAME).collection(NEWS_COLLECTION);
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}
