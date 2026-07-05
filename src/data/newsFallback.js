// src/data/newsFallback.js
//
// Shown by <NewsSection /> before scripts/scrapeNews.mjs has produced
// public/news.json for the first time, or if every source is temporarily
// unreachable. Keeping this small and hand-curated means the NEWS section
// is never empty on a fresh checkout/deploy.
//
// (These are real announcement items pulled from the KAF 5th ONE-MAN LIVE
// page at yokohamawars2026.kamitsubaki.jp/kaf — update by hand occasionally,
// or just let the scraper keep news.json current going forward.)
export const NEWS_FALLBACK = [
  {
    date: '2026.02.13',
    title: '会場連動企画情報 公開！',
    sourceLabel: 'KAF — 5th ONE-MAN LIVE',
    link: 'https://x.com/kamitsubaki_jp/status/2022143742845808932?s=20',
  },
  {
    date: '2026.02.02',
    title: '当日物販情報公開！',
    sourceLabel: 'KAF — 5th ONE-MAN LIVE',
    link: 'https://x.com/kamitsubaki_jp/status/2018248123198685637?s=20',
  },
  {
    date: '2026.01.31',
    title: '会場チケット一般発売中！',
    sourceLabel: 'KAF — 5th ONE-MAN LIVE',
    link: 'https://r-t.jp/kaf',
  },
  {
    date: '2025.10.18',
    title: '配信チケット発売決定！',
    sourceLabel: 'KAF — 5th ONE-MAN LIVE',
    link: 'https://www.zan-live.com/ja/live/detail/10656',
  },
];
