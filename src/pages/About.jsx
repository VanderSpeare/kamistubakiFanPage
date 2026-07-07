import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, X, Sparkles, ImageIcon, Volume2, VolumeX, Globe, History } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
// ============================================================================
// LOCAL ASSETS — files in your project's /public folder (served at root by
// Vite/CRA). Adjust paths here if yours live in a subfolder.
//
// NOTE ON STYLE: KAMITSUBAKI STUDIO's own game "神椿市建設中。REGENERATE" is a
// fully-voiced ADV/visual novel with its own proprietary character sprites and
// UI art — that art is copyrighted and isn't something to copy or redistribute.
// What's built below follows the *genre-standard* ADV conventions the whole
// category shares (standing sprite, bottom textbox + nameplate, backlog/log,
// click-to-advance) using your own KAFU.png and original UI chrome — same
// shape of experience, none of their actual assets.
// ============================================================================
const KAFU_PORTRAIT = '/KAFU.png';
const NAGI_INTRO_VIDEO = '/KADU-chan.mp4';

// ============================================================================
// UI STRINGS
// ============================================================================
const UI = {
  vi: {
    introSkip: 'SKIP ▸',
    inputPlaceholder: 'Nhập điều Master muốn nói với Nagi...',
    settingsTitle: 'Google AI (Gemini) API Key',
    settingsSave: 'Lưu',
    settingsNote: '⚠️ Chỉ lưu trong bộ nhớ phiên này, không được ghi lại. Khi triển khai thật, hãy gọi Gemini qua backend để key không lộ ra phía client.',
    modeLocal: 'Chế độ tra cứu cục bộ',
    modeGemini: 'Đã kết nối Gemini',
    artCaption: 'Master thấy sao ạ? Bộ trang phục này em tự chọn đấy~',
    reselectLang: 'Đổi ngôn ngữ',
    venue: 'Địa điểm', status: 'Trạng thái', debut: 'ra mắt', partOf: 'thuộc nhóm', voicedBy: 'lồng giọng bởi',
    foundIntro: 'Để em tra ngay ạ, Master~ Đây là những gì em tìm thấy:',
    notFound: 'Fufu~ Master thứ lỗi, có vẻ thông tin đó chưa có trong kho lưu trữ của em. 🌙\n\nMaster thử hỏi về một nghệ sĩ hay sự kiện khác xem sao nhé?',
    connectGemini: '(Đây là kết quả tra cứu cục bộ — hãy kết nối Gemini trong phần Cài đặt để em trả lời tự nhiên hơn nhé~)',
    greeting: "A— Master đến rồi! Chào mừng Master~ 🌙 Em là Nagi, concierge riêng của Master tại KAMITSUBAKI STUDIO. Thật vinh hạnh được gặp Master.\n\nMaster cứ hỏi em bất cứ điều gì về nghệ sĩ, sự kiện hay bộ anime nhé, em sẽ dẫn Master đi qua tất cả~",
    suggestions: ['V.W.P là nhóm gì?', 'KAMITSUBAKI WARS 2026 diễn ra khi nào?', 'KAF là ai?', 'Anime Kamitsubaki City nói về điều gì?'],
    errorPrefix: '⚠️ Master ơi, có gì đó không ổn: ',
    logTitle: 'Nhật ký hội thoại',
  },
  en: {
    introSkip: 'Skip ▸',
    inputPlaceholder: 'Say something to Nagi...',
    settingsTitle: 'Google AI (Gemini) API Key',
    settingsSave: 'Save',
    settingsNote: "⚠️ Stored in memory only for this session — not persisted. For production, proxy Gemini calls through your backend so the key is never exposed client-side.",
    modeLocal: 'Local archive mode',
    modeGemini: 'Gemini connected',
    artCaption: 'Do you like it, Master? I chose this outfit myself~',
    reselectLang: 'Change language',
    venue: 'Venue', status: 'Status', debut: 'debut', partOf: 'part of', voicedBy: 'voiced by',
    foundIntro: 'Right away, Master~ Here is what I found for you:',
    notFound: "Fufu~ forgive me, Master, but that record doesn't seem to be in my archive yet. 🌙\n\nWould you like to ask about another talent or event instead?",
    connectGemini: "(This is a local archive lookup — connect Gemini in Settings and I'll be able to speak with you more naturally~)",
    greeting: "Ah— you're here! Welcome, Master~ 🌙 I'm Nagi, your personal concierge for KAMITSUBAKI STUDIO. It's truly a pleasure.\n\nAsk me anything about our talents, live events, or the anime — I'll gladly guide you through it~",
    suggestions: ['What is V.W.P?', 'When is KAMITSUBAKI WARS 2026?', 'Who is KAF?', "What's the Kamitsubaki City anime about?"],
    errorPrefix: '⚠️ Oh dear, something went wrong: ',
    logTitle: 'Backlog',
  },
  ja: {
    introSkip: 'スキップ ▸',
    inputPlaceholder: '凪に話しかける...',
    settingsTitle: 'Google AI (Gemini) APIキー',
    settingsSave: '保存',
    settingsNote: '⚠️ このセッション中のみメモリに保存され、永続化はされません。本番環境ではバックエンド経由でGeminiを呼び出し、キーをクライアントに露出させないでください。',
    modeLocal: 'ローカル検索モード',
    modeGemini: 'Gemini接続済み',
    artCaption: 'いかがですか、ご主人様？この衣装は私が選びました~',
    reselectLang: '言語を変更',
    venue: '会場', status: 'ステータス', debut: 'デビュー', partOf: '所属', voicedBy: '声優',
    foundIntro: 'かしこまりました、ご主人様~ アーカイブで見つけたものはこちらです:',
    notFound: 'ふふ、ご主人様……申し訳ありませんが、その記録はまだ私のアーカイブにないようです。🌙\n\n他のタレントやイベントについて聞いてみませんか？',
    connectGemini: '（これはローカル検索の結果です。設定でGeminiと接続すると、もっと自然にお話しできます~）',
    greeting: 'あ、いらっしゃいませ、ご主人様~ 🌙 私は凪、KAMITSUBAKI STUDIOの専属コンシェルジュです。お会いできて光栄です。\n\nタレントやライブ、アニメについて何でも聞いてくださいね~',
    suggestions: ['V.W.Pって何ですか？', 'KAMITSUBAKI WARS 2026はいつ？', '花譜って誰？', 'アニメ『神椿市建設中。』はどんな話？'],
    errorPrefix: '⚠️ 申し訳ございません、問題が発生しました: ',
    logTitle: 'ログ',
  },
};

const STATUS_LABEL = {
  Announced: { en: 'Announced', vi: 'Đã công bố', ja: '発表済み' },
  Completed: { en: 'Completed', vi: 'Đã diễn ra', ja: '終了' },
  Upcoming: { en: 'Upcoming', vi: 'Sắp tới', ja: '今後' },
  Released: { en: 'Released', vi: 'Đã phát hành', ja: 'リリース済み' },
};

// ============================================================================
// KNOWLEDGE BASE — condensed from kamitsubaki_cleaned.json, pre-localized
// (en/vi/ja) so answers never mix languages.
// ============================================================================
const TALENTS = [
  { id: 'kaf', name: 'KAF', name_jp: '花譜', type: 'Virtual Singer', debut: '2018', groups: ['V.W.P'],
    notes: { en: 'Pioneer talent of the studio. Also lends her voice to the AI singer KAFU.', vi: 'Nghệ sĩ tiên phong của studio. Đồng thời lồng giọng cho AI singer KAFU.', ja: 'スタジオのパイオニア的存在。AIシンガー「可不」に声を提供している。' } },
  { id: 'rim', name: 'RIM', name_jp: '理芽', type: 'Virtual Singer', debut: '2019', groups: ['V.W.P'],
    notes: { en: 'Known for cover songs performed in multiple languages.', vi: 'Nổi tiếng với các bản cover bằng nhiều thứ tiếng.', ja: '多言語でのカバー楽曲で知られる。' } },
  { id: 'harusaruhi', name: 'Harusaruhi', name_jp: '春猿火', type: 'Virtual Singer/Rapper', debut: '~2019', groups: ['V.W.P'], notes: { en: '', vi: '', ja: '' } },
  { id: 'isekaijoucho', name: 'Isekaijoucho', name_jp: 'ヰ世界情緒', type: 'Virtual Singer', debut: '~2020', groups: ['V.W.P'], notes: { en: '', vi: '', ja: '' } },
  { id: 'koko', name: 'KOKO', name_jp: '幸祜', type: 'Virtual Singer', debut: '~2020', groups: ['V.W.P'], notes: { en: '', vi: '', ja: '' } },
  { id: 'kafu', name: 'KAFU', name_jp: '可不', type: 'AI Agent Singer / CeVIO AI', debut: '2021-07', groups: [],
    notes: { en: "An AI voice synthesizer developed by Kamitsubaki Studio, voiced by KAF. She doesn't perform live shows herself.", vi: 'Phần mềm giọng hát AI do Kamitsubaki Studio phát triển, được KAF lồng giọng. Không trực tiếp biểu diễn live.', ja: '神椿スタジオが開発したAI音声合成ソフト。花譜が声を担当。本人がライブに出演することはない。' } },
  { id: 'kuusou', name: 'Kuusou', name_jp: '空爽', type: 'Virtual Artist', debut: 'Recent', groups: [],
    notes: { en: "Her 1st EP 'CYAN' is set to release in 2026.", vi: "EP đầu tay 'CYAN' dự kiến phát hành năm 2026.", ja: '1stEP「CYAN」は2026年リリース予定。' } },
  { id: 'akari', name: 'Akari', name_jp: '明透', type: 'Virtual Artist', debut: '', groups: [], notes: { en: '', vi: '', ja: '' } },
  { id: 'bimai', name: 'Bimai', name_jp: '琶舞', type: 'Virtual Artist', debut: '', groups: [], notes: { en: '', vi: '', ja: '' } },
  { id: 'ciel', name: 'CIEL', name_jp: '', type: 'Virtual Artist', debut: '', groups: [],
    notes: { en: "Known for cover-song livestreams, including the 'Strawberry Live' series.", vi: "Nổi bật với các buổi live cover, đặc biệt series 'Strawberry Live'.", ja: '「ストロベリーライブ」シリーズなど、カバー配信で知られる。' } },
  { id: 'empty_old_city', name: 'Empty old City', name_jp: '', type: 'Virtual Unit/Artist', debut: '', groups: [],
    notes: { en: 'Her 2nd ONE-MAN LIVE is planned for 2026.', vi: 'ONE-MAN LIVE lần thứ 2 dự kiến diễn ra năm 2026.', ja: '2ndワンマンライブは2026年に予定されている。' } },
  { id: 'valis', name: 'VALIS', name_jp: '', type: 'Virtual Girls Group', debut: '', groups: [], members: ['CHINO', 'MYU', 'NEFFY', 'RARA', 'VITTE'],
    notes: { en: 'Held their 7th ONE-MAN LIVE in 2025, after which the group went on hiatus.', vi: 'Tổ chức ONE-MAN LIVE lần thứ 7 năm 2025, sau đó nhóm tạm ngưng hoạt động.', ja: '2025年に7thワンマンライブを開催後、活動休止に入った。' } },
  { id: 'girls_revolution_project', name: 'Girls Revolution Project', name_jp: '少女革命計画', type: 'Story + Music Unit', debut: '', groups: [], sub_units: ['Shinseiki', 'Tsumitobatsu'],
    notes: { en: 'A story-driven music unit blending narrative and songs.', vi: 'Nhóm nhạc kết hợp cốt truyện và âm nhạc.', ja: '物語と楽曲を融合させたユニット。' } },
  { id: 'anmc', name: 'ANMC', name_jp: '', type: 'Virtual Artists', debut: '', groups: [], members: ['kahoca', '一ノ瀬陽鞠'],
    notes: { en: 'Known for collaborations with games.', vi: 'Được biết đến qua các dự án hợp tác với game.', ja: 'ゲームとのコラボで知られる。' } },
];

// ============================================================================
// CHARACTER PORTRAITS — shown on the main screen in place of the old chat
// log whenever the Master asks about a specific talent (the Log button
// already covers full chat history, so that space is better used here).
//
// TO ADD A NEW CHARACTER LATER: just add one more line below, keyed by that
// talent's `id` from the TALENTS array above, pointing at their art file.
// Nothing else needs to change — resolveTalentId() and FeaturedCharacterArt
// both read from this table automatically.
// ============================================================================
const CHARACTER_PORTRAITS = {
  kaf: '/chara_main1_1.png',          // KAF
  rim: '/chara_main2_1.png',          // RIM
  harusaruhi: '/chara_main3_1.png',   // Harusaruhi (Haru)
  isekaijoucho: '/chara_main4_1.png', // Isekaijoucho (Sekai)
  koko: '/chara_main5_1.png',         // KOKO (Rinne)
  // kafu: '/chara_main6_1.png',      // <- example: next character goes here
};

// Works whether the top match is the talent itself ("who is KAF?") or an
// anime character entry that's voiced by a talent ("who plays Kafu Morisaki?").
function resolveTalentId(match) {
  if (!match) return null;
  if (match.kind === 'talent') return match.data.id;
  if (match.kind === 'character') {
    const t = TALENTS.find(t => t.name.toLowerCase() === (match.data.voiced_by || '').toLowerCase());
    return t ? t.id : null;
  }
  return null;
}

const ANIME_CHARACTERS = [
  { character: 'Kafu Morisaki', character_jp: '森先 化歩', voiced_by: 'KAF' },
  { character: 'Rime Tanioki', character_jp: '谷置 狸眼', voiced_by: 'RIM' },
  { character: 'Haru Asanushi', character_jp: '朝主 派流', voiced_by: 'Harusaruhi' },
  { character: 'Sekai Yorukawa', character_jp: '夜河 世界', voiced_by: 'Isekaijoucho' },
  { character: 'Koko Rinne', character_jp: '輪廻 此処', voiced_by: 'KOKO' },
];

const EVENTS = [
  { id: 'e1', title: "KAMITSUBAKI FES '26 FIELD OF RESONANCE", type: 'fes', date: '2026-09-05', venue: 'Pacifico Yokohama National Hall', performers: ['kaf','rim','harusaruhi','isekaijoucho','koko','kuusou','akari','bimai'], status: 'Announced', notes: null },
  { id: 'e2', title: 'KAF 5th ONE-MAN LIVE「宿声 / 深愛（巡）」', type: 'one_man_live', date: '2026-09-06', venue: 'Pacifico Yokohama National Hall', performers: ['kaf'], status: 'Announced', notes: null },
  { id: 'e3', title: 'V.W.P 4th ONE-MAN LIVE「現象Ⅳ-反転運命-」', type: 'one_man_live', date: '2026-02-28', venue: 'Pia Arena MM, Yokohama', performers: ['kaf','rim','harusaruhi','isekaijoucho','koko'], status: 'Announced', notes: null },
  { id: 'e4', title: 'Kamitsubaki City Under Construction Special Stage', type: 'exhibition_stage_event', date: '2026-03-28', venue: 'Tokyo Big Sight (AnimeJapan 2026)', performers: ['kaf','rim','harusaruhi','isekaijoucho','koko'], status: 'Completed', notes: null },
  { id: 'e5', title: 'Singularity Live Vol.4 - Harusaruhi × Isekaijoucho', type: 'two_man_live', date: '2025-11-03', venue: 'Kanadevia Hall, Tokyo', performers: ['harusaruhi','isekaijoucho'], status: 'Completed', notes: null },
  { id: 'e6', title: 'VALIS 7th ONE-MAN LIVE「彷徨フォーエバー」', type: 'one_man_live', date: '2025-12-21', venue: 'Zepp Shinjuku, Tokyo', performers: ['valis'], status: 'Completed',
    notes: { en: "Their final live before VALIS went on hiatus.", vi: "Buổi live cuối cùng trước khi VALIS tạm ngưng hoạt động.", ja: 'VALIS活動休止前、最後のライブ。' } },
  { id: 'e7', title: 'Empty old City 2nd ONE-MAN LIVE「Strings in Owl ||:echo:||」', type: 'one_man_live', date: '2026-07-31', venue: 'TBA', performers: ['empty_old_city'], status: 'Announced', notes: null },
  { id: 'e8', title: 'CIEL STREAMING COVER LIVE「ストロベリーライブ3」', type: 'streaming_cover_live', date: '2026-07-25', venue: 'YouTube Live (Online)', performers: ['ciel'], status: 'Announced', notes: null },
  { id: 'e9', title: 'Akari & Bimai Joint Live / New Song Release', type: 'joint_live', date: '2026-05-06', venue: 'Online / TBA', performers: ['akari','bimai'], status: 'Completed',
    notes: { en: 'Featured new song releases: "Little Bit" by Akari and "Tsukiyo ni Mariage" by Bimai.', vi: 'Ra mắt các bài hát mới: "Little Bit" của Akari và "Tsukiyo ni Mariage" của Bimai.', ja: '新曲「Little Bit」(明透)と「月夜にマリアージュ」(琶舞)を発表。' } },
  { id: 'e10', title: 'KAF 3rd ONE-MAN LIVE「不可解参(狂)」', type: 'one_man_live', date: '2022-08', venue: 'Nippon Budokan', performers: ['kaf'], status: 'Completed',
    notes: { en: 'The first time a virtual singer ever performed at Nippon Budokan.', vi: 'Lần đầu tiên một virtual singer biểu diễn tại Nippon Budokan.', ja: 'バーチャルシンガーとして初めて日本武道館で公演。' } },
  { id: 'e11', title: 'KAF 4th ONE-MAN LIVE「KAIKA (怪歌)」', type: 'one_man_live', date: '2024-01-14', venue: 'Yoyogi National Gymnasium', performers: ['kaf'], status: 'Completed',
    notes: { en: "KAF's first arena-scale solo live.", vi: 'Buổi solo live đầu tiên của KAF ở quy mô arena.', ja: '花譜にとって初のアリーナ規模のソロライブ。' } },
  { id: 'e12', title: 'KAF 5th Album「深愛」', type: 'album_release', date: '2026 (TBA)', venue: null, performers: ['kaf'], status: 'Upcoming', notes: null },
  { id: 'e13', title: 'KAF 4th Album「Fable」', type: 'album_release', date: '2024-12-25', venue: null, performers: ['kaf'], status: 'Released', notes: null },
  { id: 'e14', title: 'RIM「閃光だった / INSIGHT」', type: 'song_release', date: '2025-07-30', venue: null, performers: ['rim'], status: 'Released',
    notes: { en: 'Serves as the ending theme for the anime Kamitsubaki City Under Construction.', vi: 'Là ending theme cho anime Kamitsubaki City Under Construction.', ja: 'アニメ『神椿市建設中。』のエンディングテーマ。' } },
];

const SERIES_INFO = {
  title: 'KAMITSUBAKI WARS 2026 神椿横浜戦線',
  venue: 'Pacifico Yokohama National Hall',
  description: { en: "A two-night series at Pacifico Yokohama: Day 1 is KAMITSUBAKI FES (multiple artists), Day 2 is KAF's 5th ONE-MAN LIVE.", vi: 'Chuỗi sự kiện 2 đêm tại Pacifico Yokohama: Đêm 1 là KAMITSUBAKI FES (nhiều nghệ sĩ), Đêm 2 là ONE-MAN LIVE lần thứ 5 của KAF.', ja: 'パシフィコ横浜で開催される2夜連続シリーズ。1日目はKAMITSUBAKI FES(複数アーティスト)、2日目は花譜の5thワンマンライブ。' },
};

const STUDIO_INFO = {
  name: 'KAMITSUBAKI STUDIO',
  founded: '2019',
  operator: 'THINKR inc.',
  description: { en: 'A creative label managing virtual singers, artists, AI voice entities, producers, and mixed-media projects such as Kamitsubaki City.', vi: 'Creative label quản lý các virtual singer, nghệ sĩ, AI voice, producer và các dự án mixed-media như Kamitsubaki City.', ja: 'バーチャルシンガー、アーティスト、AI音声、プロデューサー、神椿市などのミクストメディアプロジェクトを手がけるクリエイティブレーベル。' },
};

const ANIME_INFO = {
  title: 'Kamitsubaki City Under Construction (神椿市建設中。)',
  year: 2025,
  tagline: { en: 'Song is magic — it can change the world, and even fate itself.', vi: 'Bài hát là phép màu — có thể thay đổi cả thế giới lẫn số phận.', ja: '歌は、魔法ーー世界も運命も変えられる。' },
};

// ============================================================================
// RAG STEP 1 — RETRIEVAL (language-agnostic search across all localized text)
// ============================================================================
function normalize(s) { return (s || '').toString().toLowerCase(); }

function scoreText(query, text) {
  const q = normalize(query); const t = normalize(text);
  if (!t) return 0;
  let score = 0;
  q.split(/\s+/).filter(w => w.length > 1).forEach(tok => { if (t.includes(tok)) score += tok.length; });
  if (t.includes(q) && q.length > 2) score += 10;
  return score;
}

function allNotesText(notesObj) { return notesObj ? Object.values(notesObj).join(' ') : ''; }

function retrieve(query, topK = 5) {
  const pool = [];
  TALENTS.forEach(t => {
    const text = [t.name, t.name_jp, t.type, allNotesText(t.notes), (t.groups||[]).join(' '), (t.members||[]).join(' ')].join(' ');
    pool.push({ kind: 'talent', data: t, score: scoreText(query, text) });
  });
  ANIME_CHARACTERS.forEach(c => pool.push({ kind: 'character', data: c, score: scoreText(query, [c.character, c.character_jp, c.voiced_by].join(' ')) }));
  EVENTS.forEach(e => {
    const text = [e.title, e.type, e.date, e.venue, e.status, (e.performers||[]).join(' '), allNotesText(e.notes)].join(' ');
    pool.push({ kind: 'event', data: e, score: scoreText(query, text) });
  });
  pool.push({ kind: 'series', data: SERIES_INFO, score: scoreText(query, SERIES_INFO.title + ' ' + allNotesText(SERIES_INFO.description)) });
  pool.push({ kind: 'studio', data: STUDIO_INFO, score: scoreText(query, STUDIO_INFO.name + ' ' + allNotesText(STUDIO_INFO.description)) });
  pool.push({ kind: 'anime', data: ANIME_INFO, score: scoreText(query, ANIME_INFO.title + ' ' + allNotesText(ANIME_INFO.tagline)) });
  return pool.filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);
}

// ============================================================================
// RAG STEP 2 — LANGUAGE NORMALIZATION ("cleaning")
// ============================================================================
function pickLang(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || '';
}

function formatContextBlock(matches, lang) {
  return matches.map(m => {
    if (m.kind === 'talent') {
      const t = m.data; const notes = pickLang(t.notes, lang);
      return `[TALENT] ${t.name}${t.name_jp ? ` (${t.name_jp})` : ''} — ${t.type}${t.debut ? `, ${UI[lang].debut} ${t.debut}` : ''}${(t.groups||[]).length ? `, ${UI[lang].partOf} ${t.groups.join(', ')}` : ''}.${notes ? ' ' + notes : ''}`;
    }
    if (m.kind === 'character') { const c = m.data; return `[CHARACTER] ${c.character} (${c.character_jp}) — ${UI[lang].voicedBy} ${c.voiced_by}`; }
    if (m.kind === 'event') {
      const e = m.data; const notes = pickLang(e.notes, lang); const status = STATUS_LABEL[e.status]?.[lang] || e.status;
      return `[EVENT] ${e.title} — ${e.date}${e.venue ? `, ${UI[lang].venue}: ${e.venue}` : ''}, ${UI[lang].status}: ${status}.${notes ? ' ' + notes : ''}`;
    }
    if (m.kind === 'series') return `[SERIES] ${m.data.title} — ${pickLang(m.data.description, lang)}`;
    if (m.kind === 'studio') return `[STUDIO] ${m.data.name} (${m.data.founded}, ${m.data.operator}) — ${pickLang(m.data.description, lang)}`;
    if (m.kind === 'anime') return `[ANIME] ${m.data.title} (${m.data.year}) — "${pickLang(m.data.tagline, lang)}"`;
    return '';
  }).join('\n');
}

function localAnswer(query, matches, lang) {
  const L = UI[lang];
  if (matches.length === 0) return L.notFound;
  const lines = matches.slice(0, 4).map(m => {
    if (m.kind === 'talent') {
      const t = m.data; const notes = pickLang(t.notes, lang);
      return `✦ **${t.name}**${t.name_jp ? ` (${t.name_jp})` : ''} — ${t.type}${t.debut ? `, ${L.debut} ${t.debut}` : ''}${(t.groups||[]).length ? `, ${L.partOf} ${t.groups.join(', ')}` : ''}.${notes ? ' ' + notes : ''}`;
    }
    if (m.kind === 'character') { const c = m.data; return `✦ **${c.character}** (${c.character_jp}) — ${L.voicedBy} ${c.voiced_by}`; }
    if (m.kind === 'event') {
      const e = m.data; const status = STATUS_LABEL[e.status]?.[lang] || e.status;
      return `✦ **${e.title}**\n   📅 ${e.date}${e.venue ? ` ・ 📍 ${e.venue}` : ''} ・ ${L.status}: ${status}`;
    }
    if (m.kind === 'series') return `✦ **${m.data.title}**: ${pickLang(m.data.description, lang)}`;
    if (m.kind === 'studio') return `✦ **${m.data.name}**: ${pickLang(m.data.description, lang)}`;
    if (m.kind === 'anime') return `✦ **${m.data.title}** (${m.data.year}) — "${pickLang(m.data.tagline, lang)}"`;
    return '';
  });
  return `${L.foundIntro}\n\n${lines.join('\n\n')}\n\n_${L.connectGemini}_`;
}

// ============================================================================
// RAG STEP 3 — GENERATION via Gemini, forced into ONE clean language
// ============================================================================
const LANG_NAME = { en: 'English', vi: 'Vietnamese', ja: 'Japanese' };

async function askGemini(apiKey, userQuery, contextBlock, history, lang) {
  const systemPrompt = `You are Nagi (凪), a devoted virtual maid and personal concierge for the KAMITSUBAKI STUDIO fansite. Stay fully in character — never mention being an AI.

LANGUAGE RULE (critical): The Master has chosen to speak ${LANG_NAME[lang]}. Reply ENTIRELY in ${LANG_NAME[lang]}, even though the CONTEXT below may contain fragments in other languages (the source data mixes Vietnamese and English). Silently translate and rewrite anything from the context into clean, natural ${LANG_NAME[lang]} — never mix languages in your reply, and never show the raw mixed-language source text.

PERSONA RULES:
- Address the user as "Master".
- Warm, polished maid courtesy; one light flourish per reply max (e.g. "Fufu~").
- Show quiet pride/enthusiasm about the talents and events.
- If CONTEXT doesn't contain the answer, apologize sweetly and say so — never invent facts, dates, or venues.
- Keep replies to about 3-6 sentences unless a list is requested.

CONTEXT (facts only — translate freely, invent nothing):
${contextBlock || '(no relevant context found in the archive)'}
`;
  const contents = [
    ...history.slice(-6).map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: userQuery }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 500 } }) }
  );
  if (!res.ok) { const errText = await res.text(); throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 200)}`); }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '...';
}

// ============================================================================
// SPRITE + AVATAR (your own asset, generic ADV framing — not the game's art)
// ============================================================================
function CharacterSprite({ breathing = true }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="absolute bottom-0 right-[4%] pointer-events-none select-none" style={{ height: '92vh', animation: breathing ? 'nagi-float 4.5s ease-in-out infinite' : 'none', filter: 'drop-shadow(0 20px 40px rgba(59,91,219,0.35))' }}>
      {imgOk ? (
        <img src={KAFU_PORTRAIT} alt="Nagi" onError={() => setImgOk(false)} className="h-full w-auto object-contain" style={{ opacity: 0.98 }} />
      ) : (
        <div className="h-full flex items-end justify-center"><div className="w-48 h-64 rounded-t-full" style={{ background: 'linear-gradient(180deg, rgba(76,110,245,0.25), transparent)' }} /></div>
      )}
    </div>
  );
}

function SmallAvatar({ size = 30 }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="relative rounded-full overflow-hidden flex-shrink-0" style={{ width: size, height: size, border: '1.5px solid rgba(120,150,255,0.5)' }}>
      {imgOk ? <img src={KAFU_PORTRAIT} alt="Nagi" onError={() => setImgOk(false)} className="w-full h-full object-cover" style={{ objectPosition: '50% 8%' }} /> : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#4c6ef5,#1a1a2e)' }} />}
    </div>
  );
}

// Occupies the space freed up by the removed on-screen chat log. Shows the
// portrait of whichever talent the Master last asked about, fading between
// characters. Silently disappears if that character has no art file yet.
function FeaturedCharacterArt({ characterId }) {
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => { setImgOk(true); }, [characterId]);
  const src = characterId ? CHARACTER_PORTRAITS[characterId] : null;

  return (
    <div className="absolute left-0 right-0 top-20 z-10 flex items-center justify-start pl-4 sm:pl-10 md:pl-16 pointer-events-none" style={{ bottom: '42vh' }}>
      <AnimatePresence mode="wait">
        {src && imgOk && (
          <motion.img
            key={characterId}
            src={src}
            alt={characterId}
            onError={() => setImgOk(false)}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="max-h-full max-w-[75%] sm:max-w-[60%] md:max-w-[48%] object-contain"
            style={{ filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.55))' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// STAGE 1 — INTRO VIDEO (plays first, before anything else)
// ============================================================================
function IntroOverlay({ onFinish, muted, setMuted }) {
  const [videoOk, setVideoOk] = useState(true);
  const [skippable, setSkippable] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSkippable(true), 1200); return () => clearTimeout(t); }, []);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center" style={{ background: '#050508' }}>
      {videoOk ? (
        <video src={NAGI_INTRO_VIDEO} autoPlay muted={muted} playsInline onEnded={onFinish} onError={() => setVideoOk(false)} className="w-full h-full object-cover" />
      ) : (
        <CharacterSprite />
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.7), transparent)' }}>
        <button onClick={() => setMuted(m => !m)} className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
        {skippable && <button onClick={onFinish} className="text-xs px-4 py-2 rounded-full text-white/90 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>Skip ▸</button>}
      </div>
    </div>
  );
}

// ============================================================================
// STAGE 2 — LANGUAGE SELECT (after intro, before any response)
// ============================================================================
function LanguageSelect({ onSelect }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-8 px-6" style={{ background: 'radial-gradient(circle at 50% 30%, #14142a 0%, #050508 85%)' }}>
      <CharacterSprite breathing={false} />
      <div className="relative z-10 text-center" style={{ animation: 'nagi-fadein 1s ease' }}>
        <div className="text-blue-300 text-sm tracking-[0.3em] mb-2">言語 · LANGUAGE · NGÔN NGỮ</div>
        <div className="text-white text-lg mb-1">Trước khi bắt đầu, Master... / Before we begin, Master...</div>
        <div className="text-gray-400 text-sm">その前に、ご主人様……何語でお話ししましょうか？</div>
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row gap-3">
        {[{ code: 'vi', label: 'Tiếng Việt' }, { code: 'en', label: 'English' }, { code: 'ja', label: '日本語' }].map(l => (
          <button key={l.code} onClick={() => onSelect(l.code)} className="px-8 py-3 rounded-full text-white text-sm font-medium tracking-wide hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, rgba(76,110,245,0.9), rgba(59,91,219,0.7))', border: '1px solid rgba(150,175,255,0.5)', boxShadow: '0 8px 24px rgba(76,110,245,0.35)' }}>
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ArtModal({ onClose, lang }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0f0f1a', border: '1px solid rgba(120,150,255,0.35)' }} onClick={e => e.stopPropagation()}>
        <img src={KAFU_PORTRAIT} alt="Nagi full design" className="w-full h-auto" />
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"><X size={16} /></button>
        <div className="p-3 text-xs text-gray-300" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>{UI[lang].artCaption}</div>
      </div>
    </div>
  );
}

function LogModal({ messages, lang, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="relative w-full sm:max-w-lg h-[70vh] sm:h-[60vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col" style={{ background: '#0c0c16', border: '1px solid rgba(76,110,245,0.35)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-white text-sm font-semibold">{UI[lang].logTitle}</span>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-gray-300"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`text-sm whitespace-pre-wrap ${m.role === 'user' ? 'text-blue-300' : 'text-gray-200'}`}>
              <span className="opacity-60 mr-1">{m.role === 'user' ? '▸' : '凪'}</span>{m.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADV-STYLE PAGINATION — long replies get split into pages that fit the
// dialogue box, shown one at a time (Next to continue, Skip to reveal all).
// ============================================================================
const PAGE_CHAR_LIMIT = 220;

function paginateText(text, limit = PAGE_CHAR_LIMIT) {
  if (!text) return [''];
  const paragraphs = text.split(/\n+/).filter(Boolean);
  const pages = [];
  let current = '';
  paragraphs.forEach(para => {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length <= limit) {
      current = candidate;
      return;
    }
    if (current) { pages.push(current); current = ''; }
    let remaining = para;
    while (remaining.length > limit) {
      let cut = remaining.lastIndexOf(' ', limit);
      if (cut <= 0) cut = limit;
      pages.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }
    current = remaining;
  });
  if (current) pages.push(current);
  return pages.length ? pages : [''];
}

// ============================================================================
// MAIN — Stage flow: intro (video) → language (select) → chat
// ============================================================================
export default function About() {
  const [stage, setStage] = useState('intro'); // 'intro' | 'language' | 'chat'
  const [lang, setLang] = useState(null);
  const [introMuted, setIntroMuted] = useState(true);
  const [showArt, setShowArt] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, ] =  import.meta.env.VITE_GEMINI_API_KEY ? [import.meta.env.VITE_GEMINI_API_KEY, null] : useState('');
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pages, setPages] = useState(['']);
  const [pageIndex, setPageIndex] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const [featuredCharacter, setFeaturedCharacter] = useState(null);
  const typeIntervalRef = useRef(null);

  const lastAssistantIdx = [...messages].map(m => m.role).lastIndexOf('assistant');

  const startTypingPage = (pageText) => {
    clearInterval(typeIntervalRef.current);
    setTypedText(''); setIsTyping(true);
    let i = 0;
    typeIntervalRef.current = setInterval(() => {
      i += 2; setTypedText(pageText.slice(0, i));
      if (i >= pageText.length) { clearInterval(typeIntervalRef.current); setIsTyping(false); }
    }, 16);
  };

  useEffect(() => {
    if (lastAssistantIdx === -1) return;
    const fullText = messages[lastAssistantIdx].text;
    const newPages = paginateText(fullText);
    setPages(newPages);
    setPageIndex(0);
    startTypingPage(newPages[0]);
    return () => clearInterval(typeIntervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const isLastPage = pageIndex >= pages.length - 1;

  const goNextPage = () => {
    const next = pageIndex + 1;
    if (next >= pages.length) return;
    setPageIndex(next);
    startTypingPage(pages[next]);
  };

  const completeTyping = () => {
    if (!isTyping) return;
    clearInterval(typeIntervalRef.current);
    setTypedText(pages[pageIndex] || '');
    setIsTyping(false);
  };

  // Click anywhere on the box: finish the current page instantly, or (if
  // already finished) advance to the next page — classic ADV click-through.
  const handleBoxClick = () => {
    if (isTyping) { completeTyping(); return; }
    if (!isLastPage) { goNextPage(); }
  };

  // "Skip": jump straight to the end of the whole message, all pages done.
  const handleSkip = () => {
    clearInterval(typeIntervalRef.current);
    const lastIdx = Math.max(pages.length - 1, 0);
    setPageIndex(lastIdx);
    setTypedText(pages[lastIdx] || '');
    setIsTyping(false);
  };

  // Auto mode: once a page finishes typing, wait a beat then continue on.
  useEffect(() => {
    if (!autoMode || isTyping || isLastPage) return;
    const t = setTimeout(goNextPage, 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, isTyping, pageIndex, pages]);

  // Stage transitions: intro → language → chat
  const finishIntro = () => setStage('language');

  const selectLanguage = (code) => {
    setLang(code);
    setMessages([{ role: 'assistant', text: UI[code].greeting }]);
    setStage('chat');
  };

  const backToLanguage = () => { setStage('language'); setMessages([]); };

  const handleSaveGame = () => {
    try {
      localStorage.setItem('nagi_save', JSON.stringify({ lang, messages }));
    } catch (e) { /* storage unavailable — fail silently, non-critical */ }
  };

  const handleLoadGame = () => {
    try {
      const raw = localStorage.getItem('nagi_save');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.lang && Array.isArray(saved.messages) && saved.messages.length) {
        setLang(saved.lang);
        setMessages(saved.messages);
        setStage('chat');
      }
    } catch (e) { /* corrupt/missing save — ignore */ }
  };

  const handleSend = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading || !lang) return;
    const newMessages = [...messages, { role: 'user', text: q }];
    setMessages(newMessages); setInput(''); setLoading(true);
    try {
      const matches = retrieve(q, 5);
      const contextBlock = formatContextBlock(matches, lang);

      const topTalentId = matches.map(resolveTalentId).find(id => id && CHARACTER_PORTRAITS[id]);
      if (topTalentId) setFeaturedCharacter(topTalentId);

      let replyText;
      if (apiKey) {
        replyText = await askGemini(apiKey, q, contextBlock, newMessages, lang);
      } else {
        await new Promise(r => setTimeout(r, 400));
        replyText = localAnswer(q, matches, lang);
      }
      setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `${UI[lang].errorPrefix}${err.message}` }]);
    } finally { setLoading(false); }
  };

  const L = lang ? UI[lang] : UI.en;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ fontFamily: "'Hiragino Kaku Gothic Pro','Yu Gothic',sans-serif", background: 'radial-gradient(circle at 70% 20%, #1c1c3a 0%, #06060c 75%)' }}>
      <style>{`
        @keyframes nagi-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes nagi-fadein { 0% { opacity: 0; transform: translateY(8px);} 100% { opacity: 1; transform: translateY(0);} }
        @keyframes nagi-pop { 0% { opacity: 0; transform: translateY(6px) scale(0.97);} 100% { opacity: 1; transform: translateY(0) scale(1);} }
        @keyframes nagi-twinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.6; } }
        .nagi-star { position:absolute; width:2px; height:2px; background:#fff; border-radius:50%; animation: nagi-twinkle 4s ease-in-out infinite; }
        .adv-btn {
          padding: 7px 10px; border-radius: 8px; font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap;
          color: #cfe0ff; background: rgba(20,20,35,0.85); border: 1px solid rgba(120,150,255,0.35);
          transition: all 0.2s ease; cursor: pointer;
        }
        .adv-btn:hover { background: rgba(76,110,245,0.4); color: #fff; border-color: rgba(150,175,255,0.7); }
        .adv-btn.active { background: rgba(76,110,245,0.55); color: #fff; }
        .nagi-choice-btn {
          width: 100%; text-align: left; padding: 12px 20px; border-radius: 10px;
          font-size: 14px; font-weight: 600; color: #14142a; background: rgba(245,247,255,0.96);
          border: 1px solid rgba(255,255,255,0.6); transition: all 0.18s ease; cursor: pointer;
        }
        .nagi-choice-btn:hover { background: rgba(76,110,245,0.92); color: #fff; transform: translateX(2px); }
        .nagi-saveload-btn {
          padding: 5px 22px; border-radius: 999px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; color: #cfe0ff; background: rgba(15,15,26,0.9);
          border: 1px solid rgba(120,150,255,0.45); cursor: pointer; transition: all 0.2s ease;
        }
        .nagi-saveload-btn:hover { background: rgba(76,110,245,0.4); color: #fff; }
      `}</style>

      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="nagi-star" style={{ top: `${(i * 37) % 100}%`, left: `${(i * 53) % 100}%`, animationDelay: `${(i % 10) * 0.4}s` }} />
      ))}

      {stage === 'intro' && <IntroOverlay onFinish={finishIntro} muted={introMuted} setMuted={setIntroMuted} />}
      {stage === 'language' && <LanguageSelect onSelect={selectLanguage} />}
      {showArt && <ArtModal onClose={() => setShowArt(false)} lang={lang || 'en'} />}
      {showLog && <LogModal messages={messages} lang={lang || 'en'} onClose={() => setShowLog(false)} />}

      {stage === 'chat' && lang && (
        <>
          <CharacterSprite />

          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-4 z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <SmallAvatar size={34} />
              <div>
                <div className="font-semibold flex items-center gap-1">凪 Nagi <Sparkles size={12} className="text-blue-300" /></div>
                <div className="text-[11px] text-gray-400">{apiKey ? L.modeGemini : L.modeLocal}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowLog(true)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300" title={L.logTitle}><History size={16} /></button>
              <button onClick={backToLanguage} className="p-2 rounded-lg hover:bg-white/10 text-gray-300" title={L.reselectLang}><Globe size={16} /></button>
              <button onClick={() => setShowArt(true)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300" title="Art"><ImageIcon size={16} /></button>
              <button onClick={() => { setShowSettings(s => !s); setApiKeyDraft(apiKey); }} className="p-2 rounded-lg hover:bg-white/10 text-gray-300"><Settings size={16} /></button>
            </div>
          </div>

          {showSettings && (
            <div className="absolute top-16 right-5 z-20 w-72 rounded-xl p-4 text-xs" style={{ background: 'rgba(15,15,26,0.97)', border: '1px solid rgba(76,110,245,0.35)', backdropFilter: 'blur(10px)' }}>
              <label className="text-gray-300 block mb-1">{L.settingsTitle}</label>
              <div className="flex gap-2">
                <input type="password" value={apiKeyDraft} onChange={e => setApiKeyDraft(e.target.value)} placeholder="AIzaSy..." className="flex-1 px-2 py-1.5 rounded-md bg-black/40 text-white border border-white/10 outline-none focus:border-blue-500 text-xs" />
                <button onClick={() => { setApiKey(apiKeyDraft); setShowSettings(false); }} className="px-3 py-1.5 rounded-md text-white text-xs font-medium" style={{ background: '#4c6ef5' }}>{L.settingsSave}</button>
              </div>
              <p className="text-gray-500 mt-2 leading-relaxed">{L.settingsNote}</p>
            </div>
          )}

          <FeaturedCharacterArt characterId={featuredCharacter} />

          <div className="absolute inset-x-0 bottom-0 z-10 px-3 sm:px-6 pb-3">
            <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>

              {/* ================================================================
                  3 ANSWER BOXES — 2 quick-reply choices + the typing box
                  itself as the 3rd, all in the same VN "choice" visual style.
                  Only shown once the current page is fully read (isLastPage).
              ================================================================ */}
              {!loading && !isTyping && isLastPage && lang && (() => {
                const s = UI[lang].suggestions;
                const start = messages.length % s.length;
                const quickChoices = [s[start], s[(start + 1) % s.length]];
                return (
                  <div className="mb-3 flex flex-col gap-2" style={{ animation: 'nagi-fadein 0.4s ease' }}>
                    {quickChoices.map((choice, i) => (
                      <button key={i} onClick={() => handleSend(choice)} className="nagi-choice-btn">
                        {choice}
                      </button>
                    ))}
                    {/* the typing box, styled to match the two choices above it */}
                    <div className="flex items-center gap-2 rounded-[10px] pl-5 pr-2 py-1.5" style={{ background: 'rgba(245,247,255,0.96)', border: '1px solid rgba(255,255,255,0.6)' }}>
                      <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={L.inputPlaceholder}
                        className="flex-1 bg-transparent outline-none text-sm font-medium text-[#14142a] placeholder-gray-500 py-1.5"
                      />
                      <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="p-2 rounded-full disabled:opacity-30 transition-opacity" style={{ background: '#4c6ef5' }}>
                        <Send size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* ================================================================
                  MAIN ANSWER/DIALOGUE BOX — full width both sides, ~1/4 page
                  tall, with the ADV side-column (Skip/Log/Menu/Auto) beside it.
              ================================================================ */}
              <div className="flex items-stretch gap-2 sm:gap-3">
                <div
                  onClick={handleBoxClick}
                  className="relative flex-1 flex rounded-2xl overflow-hidden cursor-pointer"
                  style={{ background: 'rgba(10,10,18,0.94)', border: '1px solid rgba(76,110,245,0.45)', backdropFilter: 'blur(14px)', minHeight: '25vh' }}
                >
                  {/* small portrait, like the nameplate avatar in ADV textboxes */}
                  <div className="flex items-start pt-5 pl-3 sm:pl-4">
                    <SmallAvatar size={48} />
                  </div>

                  <div className="flex-1 pt-5 px-4 sm:px-5 pb-9 flex flex-col">
                    <div className="text-blue-300 text-sm font-semibold mb-1.5 flex items-center gap-1">
                      凪 Nagi <Sparkles size={11} />
                    </div>
                    <div className="text-white text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1" style={{ maxHeight: '16vh' }}>
                      {loading ? (
                        <div className="flex gap-1 pt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <>{typedText}{!isTyping && isLastPage && <span className="ml-1 text-blue-300 animate-pulse">▼</span>}</>
                      )}
                    </div>
                  </div>

                  {/* page indicator, e.g. "2/3" — only shown when a message spans multiple pages */}
                  {pages.length > 1 && (
                    <span className="absolute bottom-3 left-4 text-[10px] tracking-wider text-white/40">{pageIndex + 1} / {pages.length}</span>
                  )}

                  {/* Next control — advances to the next page once typing has finished */}
                  {!loading && !isTyping && !isLastPage && (
                    <button
                      onClick={e => { e.stopPropagation(); goNextPage(); }}
                      className="absolute bottom-3 right-4 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-blue-200 px-3 py-1 rounded-full"
                      style={{ background: 'rgba(76,110,245,0.3)', border: '1px solid rgba(120,150,255,0.4)' }}
                    >
                      Next ▼
                    </button>
                  )}
                </div>

                {/* ADV control column — Skip / Log / Menu / Auto */}
                <div className="hidden sm:flex flex-col justify-end gap-2 pb-1">
                  <button onClick={handleSkip} className="adv-btn" title="Skip through the current message">Skip</button>
                  <button onClick={() => setShowLog(true)} className="adv-btn">Log</button>
                  <button onClick={() => { setShowSettings(s => !s); setApiKeyDraft(apiKey); }} className="adv-btn">Menu</button>
                  <button onClick={() => setAutoMode(a => !a)} className={`adv-btn ${autoMode ? 'active' : ''}`}>Auto</button>
                </div>
              </div>

              {/* Save / Load — centered under the box, like classic ADV UIs */}
              <div className="flex justify-center gap-3 mt-2">
                <button onClick={handleSaveGame} className="nagi-saveload-btn">{lang === 'vi' ? 'Lưu' : lang === 'ja' ? 'セーブ' : 'Save'}</button>
                <button onClick={handleLoadGame} className="nagi-saveload-btn">{lang === 'vi' ? 'Tải' : lang === 'ja' ? 'ロード' : 'Load'}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}