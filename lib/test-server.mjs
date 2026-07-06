// backend/test-server.mjs
//
// Local-only helper to test api/news.js without deploying or installing
// the Vercel CLI. Not meant for production — just for `node test-server.mjs`
// + curl/browser while developing.
//
// Usage:
//   npm install express
//   node --env-file=.env test-server.mjs
//   curl http://localhost:3001/api/news
//   curl http://localhost:3001/api/events
import express from 'express';
import newsHandler from '../api/news.js';
import eventsHandler from '../api/events.js';

const app = express();

// Both handlers read req.query — Express populates that natively, so they
// work unmodified here.
app.get('/api/news', (req, res) => newsHandler(req, res));
app.get('/api/events', (req, res) => eventsHandler(req, res));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running:`);
  console.log(`  http://localhost:${PORT}/api/news`);
  console.log(`  http://localhost:${PORT}/api/events`);
});
