// src/components/NewsSection.jsx
//
// NEWS section for the landing page. Fetches /api/news — a serverless
// endpoint (see api/news.js) backed by MongoDB, populated by
// scripts/scrapeNews.mjs. Falls back to a small curated list
// (src/data/newsFallback.js) if the request fails, so the section is
// never blank.
//
// The "Refresh" button calls POST /api/refresh-news (runs the scraper
// on demand, ~15-40s since it launches a real browser + hits several
// sources) and then re-fetches /api/news once that completes.
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHero from './SectionHero'; // adjust the path if yours differs
import { NEWS_FALLBACK } from '../data/newsFallback';

// Defense-in-depth: api/news.js already strips unsafe URL schemes server
// side, but this component checks again before ever putting a value into
// href/src — cheap insurance if it's ever pointed at a different data
// source that skips that step.
function isSafeUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// The Refresh button depends on POST /api/refresh-news, which launches a
// real Playwright browser — that endpoint is intentionally NOT deployed
// to Vercel (serverless functions there can't run a full browser within
// the timeout). It's only wired up for local dev via test-server.mjs, so
// the button is hidden in any other environment (`import.meta.env.DEV`
// is Vite's standard "am I in `vite dev`" flag — true locally, false in
// a production build).
const REFRESH_ENABLED = import.meta.env.DEV;

export default function NewsSection({ limit = 6 }) {
  const [news, setNews] = useState(NEWS_FALLBACK);
  const [usingFallback, setUsingFallback] = useState(true);
  const [refreshState, setRefreshState] = useState('idle'); // 'idle' | 'scraping' | 'done' | 'error' | 'rate-limited'

  const loadNews = useCallback(() => {
    return fetch(`/api/news?limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
          setUsingFallback(false);
        }
      });
  }, [limit]);

  useEffect(() => {
    let cancelled = false;
    loadNews().catch(() => {
      // Keep the fallback list — expected before the scraper has run at
      // least once, or if the API is briefly unreachable.
      if (!cancelled) setUsingFallback(true);
    });
    return () => { cancelled = true; };
  }, [loadNews]);

  const handleRefresh = async () => {
    if (refreshState === 'scraping') return; // already running, ignore double-click
    setRefreshState('scraping');
    try {
      const res = await fetch('/api/refresh-news', { method: 'POST' });
      if (res.status === 429) {
        setRefreshState('rate-limited');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadNews();
      setRefreshState('done');
    } catch {
      setRefreshState('error');
    } finally {
      setTimeout(() => setRefreshState('idle'), 4000); // reset the button label after a bit
    }
  };

  const items = news.slice(0, limit);

  return (
    <SectionHero id="news" title="NEWS" subtitle="Latest Updates">
      {/* Refresh control — dev-only, see REFRESH_ENABLED above */}
      {REFRESH_ENABLED && (
        <div className="flex justify-end w-full max-w-7xl mb-6">
          <button
            onClick={handleRefresh}
            disabled={refreshState === 'scraping'}
            className="flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-widest rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshState === 'scraping' ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <AnimatePresence mode="wait">
              <motion.span
                key={refreshState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {refreshState === 'scraping' && 'Fetching latest…'}
                {refreshState === 'done' && 'Updated!'}
                {refreshState === 'rate-limited' && 'Please wait a few minutes'}
                {refreshState === 'error' && 'Failed — try again'}
                {refreshState === 'idle' && 'Refresh'}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl">
        {items.map((item, i) => (
          <motion.article
            key={item.link ?? `${item.title}-${i}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all"
          >
            {isSafeUrl(item.image) && (
              <img
                src={item.image}
                alt=""
                className="w-full h-40 object-cover rounded-xl mb-6"
                loading="lazy"
              />
            )}
            <time className="text-sm text-gray-400 mb-4 block">{item.date}</time>
            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
            {item.desc && <p className="text-gray-300 mb-4">{item.desc}</p>}
            {item.sourceLabel && (
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
                {item.sourceLabel}
              </p>
            )}
            {isSafeUrl(item.link) && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                View →
              </a>
            )}
          </motion.article>
        ))}
      </div>

      {usingFallback && refreshState === 'idle' && (
        <p className="text-xs text-white/30 mt-6">
          {REFRESH_ENABLED
            ? 'Showing cached updates — press Refresh above to pull the latest into the database.'
            : 'Showing cached updates.'}
        </p>
      )}
    </SectionHero>
  );
}
