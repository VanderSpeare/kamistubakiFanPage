// backend/test-connection.mjs
//
// Minimal, standalone check that MONGODB_URI actually connects — no
// scraping, no API, just "can I reach Atlas with this string". Run this
// FIRST whenever something Mongo-related seems broken, before debugging
// the scraper or API — it isolates connection problems (bad password,
// IP not whitelisted, wrong URI) from application-logic problems.
//
// Usage:
//   node --env-file=.env test-connection.mjs
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not set. Did you forget --env-file=.env ?');
  process.exit(1);
}

// JSON.stringify (not console.log directly) makes hidden issues visible:
// stray quotes, leading/trailing whitespace, or a trailing newline that
// got copy-pasted in will show up here as literal \" \n or extra spaces
// inside the string, right where a plain console.log would hide them.
console.log('Raw URI (password masked, quoted to reveal hidden chars):');
console.log(JSON.stringify(uri.replace(/:[^:@]+@/, ':****@')));

console.log(`Connecting to: ${uri.replace(/:[^:@]+@/, ':****@')}`); // mask password in the log

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

try {
  await client.connect();
  const dbName = client.db().databaseName;
  await client.db(dbName).command({ ping: 1 });

  console.log(`✅ Connected successfully. Default database resolved from URI: "${dbName}"`);

  const collections = await client.db(dbName).listCollections().toArray();
  console.log(`Collections in "${dbName}":`, collections.map((c) => c.name).join(', ') || '(none yet)');
} catch (err) {
  console.error('❌ Connection failed:', err.message);
  console.error('\nCommon causes:');
  console.error('  - IP not whitelisted → Atlas dashboard → Network Access → Add IP Address');
  console.error('  - Wrong password, or special characters in it not URL-encoded');
  console.error('  - Typo in the connection string (missing +srv, wrong cluster hostname)');
  process.exit(1);
} finally {
  await client.close();
}
