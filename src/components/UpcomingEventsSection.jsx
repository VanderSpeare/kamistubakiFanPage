// src/components/UpcomingEventsSection.jsx
//
// "Upcoming Events" section for the landing page. Fetches /api/events —
// the structured, dated event data (imported via
// scripts/importKnowledgeBase.mjs) — NOT the news_feed used by
// NewsSection.jsx. Distinct visual treatment on purpose: this is a
// calendar of confirmed shows (date, countdown, venue, tickets), not a
// scrolling announcement feed.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHero from './SectionHero'; // adjust the path if yours differs

function daysUntil(dateStr) {
  const target = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = target - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function UpcomingEventsSection({ limit = 4 }) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'empty' | 'error'

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/events?limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setEvents(Array.isArray(data) ? data : []);
        setStatus(Array.isArray(data) && data.length > 0 ? 'ready' : 'empty');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => { cancelled = true; };
  }, [limit]);

  // Nothing confirmed and upcoming right now — quietly omit the section
  // rather than showing an empty/broken-looking block.
  if (status === 'empty' || status === 'error') return null;

  return (
    <SectionHero id="upcoming-events" title="UPCOMING EVENTS" subtitle="Don't miss what's next">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
        {status === 'loading' && (
          <p className="text-white/40 text-sm col-span-full">Loading upcoming events…</p>
        )}

        {events.map((event, i) => {
          const remaining = daysUntil(event.date);
          return (
            <motion.article
              key={event.id ?? i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="flex gap-6 bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-red-500/40 transition-all"
            >
              {/* Countdown block */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-red-600/10 border border-red-500/30">
                <span className="text-2xl font-bold text-red-400 leading-none">
                  {remaining >= 0 ? remaining : '—'}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white/50 mt-1">
                  {remaining === 0 ? 'Today' : remaining === 1 ? 'day left' : 'days left'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {event.seriesTitle && (
                  <p className="text-xs uppercase tracking-widest text-red-400/80 mb-1 truncate">
                    {event.seriesTitle}
                  </p>
                )}
                <h3 className="text-xl font-bold mb-2 leading-snug">{event.title}</h3>
                <p className="text-sm text-white/60 mb-1">{formatDate(event.date)}</p>
                {event.venue?.name && (
                  <p className="text-sm text-white/50 mb-4">{event.venue.name}</p>
                )}

                {event.tickets?.official_page && (
                  <a
                    href={event.tickets.official_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Ticket info →
                  </a>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </SectionHero>
  );
}
