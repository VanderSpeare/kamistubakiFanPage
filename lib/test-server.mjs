// backend/test-server.mjs
//
// Local-only helper to test api/*.js without deploying or installing the
// Vercel CLI. Not meant for production — just for `node test-server.mjs`
// + curl/browser while developing.
//
// Usage:
//   npm install express
//   node --env-file=.env test-server.mjs
//   curl http://localhost:3001/api/news
//   curl http://localhost:3001/api/events
//   curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d "{\"query\":\"who is KAF\",\"lang\":\"en\",\"history\":[]}"
import express from 'express';
import newsHandler from '../api/news.js';
import eventsHandler from '../api/events.js';
import chatHandler from '../api/chat.js';

const app = express();

// REQUIRED for POST routes like /api/chat — without this, req.body is
// undefined and every chat request fails validation ("query is required")
// regardless of what the client actually sent.
app.use(express.json());

// GET handlers read req.query — Express populates that natively, so they
// work unmodified here.
app.get('/api/news', (req, res) => newsHandler(req, res));
app.get('/api/events', (req, res) => eventsHandler(req, res));
app.post('/api/chat', (req, res) => chatHandler(req, res));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running:`);
  console.log(`  http://localhost:${PORT}/api/news`);
  console.log(`  http://localhost:${PORT}/api/events`);
  console.log(`  POST http://localhost:${PORT}/api/chat`);
});
