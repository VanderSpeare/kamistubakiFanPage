// src/pages/Calendar.jsx
//
// A standalone page recreating the Persona 5 Royal calendar UI — bold
// diagonal red/black/white color blocking, a jagged "torn paper" divider,
// and a "Daily Log" note card — populated with real data from the
// `events` collection (GET /api/events?all=true).
//
// ROUTING: this is a page, not a landing-page section. Wire it up wherever
// your router lives, e.g.:
//   import Calendar from './pages/Calendar';
//   <Route path="/calendar" element={<Calendar />} />
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Calendar() {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedKey, setSelectedKey] = useState(toDateKey(today.getFullYear(), today.getMonth(), today.getDate()));
  const [eventsByDate, setEventsByDate] = useState({});
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [members, setMembers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/events?all=true&limit=200')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
        const grouped = {};
        for (const event of Array.isArray(data) ? data : []) {
          if (typeof event.date !== 'string' || !isoDatePattern.test(event.date)) continue; // skip TBA/partial dates — nothing to plot on a grid
          (grouped[event.date] ??= []).push(event);
        }
        setEventsByDate(grouped);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    // Fetched independently of events — this powers the fallback "stream
    // list" shown if the events feed fails, so it needs its own
    // success/failure path rather than piggybacking on the events fetch.
    fetch('/api/talents')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setMembers(data);
      })
      .catch(() => {
        /* silently ignore — the fallback list just won't render if this fails too */
      });

    return () => { cancelled = true; };
  }, []);

  // Shuffled once per mount — "random stream" ordering, not re-shuffled
  // on every render (which would make the list visibly jump around).
  const shuffledMembers = useMemo(() => {
    return [...members].sort(() => Math.random() - 0.5);
  }, [members]);

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedEvents = eventsByDate[selectedKey] || [];
  const selectedDateObj = useMemo(() => new Date(`${selectedKey}T00:00:00`), [selectedKey]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans select-none">
      {/* ============================================================
          Diagonal color-block background — the P5R signature slash.
          Dark maroon panel (calendar side) cut by a jagged white/gray
          panel (Daily Log side), via a many-point clip-path so the seam
          reads as torn/aggressive rather than a clean diagonal line.
      ============================================================ */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a0303] via-[#1a0202] to-black" />
      <div
        className="absolute inset-0 bg-[#e8e6e1]"
        style={{
          clipPath:
            'polygon(58% 0%, 64% 4%, 60% 9%, 67% 14%, 62% 19%, 70% 24%, 100% 20%, 100% 100%, 55% 100%, 60% 92%, 52% 86%, 58% 79%, 50% 72%, 100% 20%)',
        }}
      />
      {/* thin red seam glow along the jagged edge for extra grit */}
      <div
        className="absolute inset-0 opacity-70 mix-blend-screen pointer-events-none"
        style={{
          clipPath:
            'polygon(57% 0%, 58.5% 0%, 64.5% 4%, 60.5% 9%, 67.5% 14%, 62.5% 19%, 70.5% 24%, 100% 20.3%, 100% 20%, 62% 19%, 67% 14%, 60% 9%, 64% 4%, 58% 0%)',
          background: '#ff1f3d',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen p-6 sm:p-10 lg:p-14 gap-10">
        {/* ============================================================
            LEFT — Calendar grid
        ============================================================ */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl">
          {/* Weekday header */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((wd, i) => (
              <span
                key={wd}
                className={`text-lg sm:text-xl font-black italic tracking-wider ${
                  i === 6 ? 'text-[#3fd0ff]' : 'text-white/90'
                }`}
                style={{ transform: 'skewX(-8deg)' }}
              >
                {wd}
              </span>
            ))}
          </div>

          <div className="h-[2px] bg-white/30 mb-4 w-full" style={{ transform: 'skewX(-8deg)' }} />

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-3">
            {grid.map((day, i) => {
              if (day === null) return <div key={i} />;

              const key = toDateKey(viewYear, viewMonth, day);
              const isWeekend = i % 7 === 6; // Saturday
              const hasEvents = Boolean(eventsByDate[key]?.length);
              const isSelected = key === selectedKey;
              const isToday = key === todayKey;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedKey(key)}
                  className="relative flex items-center justify-center h-12 sm:h-14 group"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="calendar-selected-diamond"
                      className="absolute w-10 h-10 sm:w-12 sm:h-12 bg-[#e2001a] rotate-45"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 text-2xl sm:text-3xl font-black transition-colors ${
                      isSelected
                        ? 'text-white'
                        : hasEvents
                        ? 'text-[#ff3b3b]'
                        : isWeekend
                        ? 'text-[#3fd0ff]'
                        : 'text-white/70 group-hover:text-white'
                    }`}
                  >
                    {day}
                  </span>
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-1 z-10 w-1.5 h-1.5 rounded-full bg-[#ff3b3b]" />
                  )}
                  {isToday && !isSelected && (
                    <span className="absolute -bottom-0.5 z-10 w-6 h-[2px] bg-white/60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            RIGHT — Month controls + Daily Log
        ============================================================ */}
        <div className="flex-1 flex flex-col items-end justify-start max-w-xl mx-auto lg:mx-0">
          {/* Month nav */}
          <div className="flex items-center gap-4 mb-4 text-black">
            <button
              onClick={() => changeMonth(-1)}
              className="px-4 py-1 bg-black text-white text-xs font-black tracking-widest skew-x-[-8deg] hover:bg-[#e2001a] transition-colors"
            >
              <span className="inline-block skew-x-[8deg]">EARLIER</span>
            </button>
            <span className="text-3xl sm:text-4xl font-black italic tracking-widest" style={{ transform: 'skewX(-8deg)' }}>
              {MONTH_NAMES[viewMonth]}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="px-4 py-1 bg-black text-white text-xs font-black tracking-widest skew-x-[-8deg] hover:bg-[#e2001a] transition-colors"
            >
              <span className="inline-block skew-x-[8deg]">UPCOMING</span>
            </button>
          </div>

          <div className="bg-black text-white px-5 py-1.5 mb-8 text-sm sm:text-base font-bold tracking-wider" style={{ transform: 'skewX(-8deg)' }}>
            <span className="inline-block" style={{ transform: 'skewX(8deg)' }}>
              {selectedDateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })} (
              {selectedDateObj.toLocaleDateString('en-US', { weekday: 'short' })})
            </span>
          </div>

          {/* Daily Log card */}
          <motion.div
            key={selectedKey}
            initial={{ opacity: 0, y: 16, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.25 }}
            className="relative w-full bg-[#faf8f2] text-black px-8 py-7 shadow-[0_20px_40px_rgba(0,0,0,0.4)] min-h-[280px]"
          >
            <div className="flex items-baseline gap-2 mb-5 border-b-2 border-black/70 pb-2">
              <h2 className="text-3xl font-black italic tracking-wide">Daily</h2>
              <span className="text-3xl font-black bg-black text-[#faf8f2] px-2">Log</span>
            </div>

            {status === 'loading' && (
              <p className="text-sm text-black/40 italic mt-4">Loading the schedule…</p>
            )}

            {status === 'error' && (
              <div className="mt-2">
                <p className="text-sm text-black/50 italic mb-3">The schedule's offline — catch a stream instead:</p>
                {shuffledMembers.length === 0 ? (
                  <p className="text-sm text-black/40 italic">Nothing to suggest right now.</p>
                ) : (
                  <ul className="space-y-2">
                    {shuffledMembers.slice(0, 5).map((member) => (
                      <li key={member.id}>
                        <a
                          href={member.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-bold text-[#c8001a] underline decoration-2 underline-offset-4 hover:text-black transition-colors"
                        >
                          {member.name} - Stream
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {status === 'ready' && selectedEvents.length === 0 && (
              <p className="text-sm text-black/40 italic mt-4">Nothing logged for this date.</p>
            )}

            {status === 'ready' && selectedEvents.length > 0 && (
              <ul className="space-y-4">
                <AnimatePresence>
                  {selectedEvents.map((event, i) => (
                    <motion.li
                      key={event.id ?? i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border-b border-black/15 pb-3"
                    >
                      <p className="text-lg font-bold text-[#c8001a] underline decoration-2 underline-offset-4">
                        {event.title}
                      </p>
                      {(event.venue?.name || event.seriesTitle) && (
                        <p className="text-sm text-black/60 mt-1">
                          {event.seriesTitle ? `${event.seriesTitle} — ` : ''}
                          {event.venue?.name}
                        </p>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}

            {/* torn notebook edge marks, right side */}
            <div className="absolute right-0 top-6 bottom-6 flex flex-col justify-between">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="w-3 h-1.5 bg-black/80" />
              ))}
            </div>

            {/* Chibi mascot peeking out of the card — matches P5R's habit of
                letting character art overlap and break out of UI panels
                rather than sit neatly contained inside them. */}
            <img
              src="/chibiKaf.webp"
              alt=""
              aria-hidden="true"
              className="absolute -bottom-8 -right-6 w-24 sm:w-32 pointer-events-none select-none z-20 drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]"
            />
          </motion.div>

          <p className="mt-6 text-white/50 text-xs sm:text-sm italic tracking-wide">
            Select a date to view scheduled events.
          </p>
        </div>
      </div>
    </div>
  );
}