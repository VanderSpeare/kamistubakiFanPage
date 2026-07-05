// src/components/NewsSection.jsx
//
// NEWS section for the landing page. Fetches /api/news — a serverless
// endpoint (see api/news.js) backed by MongoDB, populated by
// scripts/scrapeNews.mjs. Falls back to a small curated list
// (src/data/newsFallback.js) if the request fails, so the section is
// never blank (e.g. on first deploy before the scraper has run, or if
// the API/DB is briefly unreachable).
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHero from './SectionHero'; // adjust the path if yours differs
import { NEWS_FALLBACK } from '../data/newsFallback';

export default function NewsSection({ limit = 6 }) {
  const [news, setNews] = useState(NEWS_FALLBACK);
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/news?limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setNews(data);
          setUsingFallback(false);
        }
      })
      .catch(() => {
        // Keep the fallback list — expected before the scraper has run
        // at least once, or if the API is briefly unreachable.
      });

    return () => { cancelled = true; };
  }, [limit]);

  const items = news.slice(0, limit);

  return (
    <SectionHero id="news" title="NEWS" subtitle="Latest Updates">
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
            {item.image && (
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
            {item.link && (
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

      {usingFallback && (
        <p className="text-xs text-white/30 mt-6">
          Showing cached updates — run <code>npm run scrape:news</code> to pull the latest into the database.
        </p>
      )}
    </SectionHero>
  );
}
