import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, ImageIcon, Volume2, VolumeX, Globe, History } from 'lucide-react';
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
    modeGemini: 'Được hỗ trợ bởi Gemini',
    artCaption: 'Master thấy sao ạ? Bộ trang phục này em tự chọn đấy~',
    reselectLang: 'Đổi ngôn ngữ',
    greeting: "A— Master đến rồi! Chào mừng Master~ 🌙 Em là Nagi, concierge riêng của Master tại KAMITSUBAKI STUDIO. Thật vinh hạnh được gặp Master.\n\nMaster cứ hỏi em bất cứ điều gì về nghệ sĩ, sự kiện hay bộ anime nhé, em sẽ dẫn Master đi qua tất cả~",
    suggestions: ['V.W.P là nhóm gì?', 'KAMITSUBAKI WARS 2026 diễn ra khi nào?', 'KAF là ai?', 'Anime Kamitsubaki City nói về điều gì?'],
    errorPrefix: '⚠️ Master ơi, có gì đó không ổn: ',
    logTitle: 'Nhật ký hội thoại',
  },
  en: {
    introSkip: 'Skip ▸',
    inputPlaceholder: 'Say something to Nagi...',
    modeGemini: 'Powered by Gemini',
    artCaption: 'Do you like it, Master? I chose this outfit myself~',
    reselectLang: 'Change language',
    greeting: "Ah— you're here! Welcome, Master~ 🌙 I'm Nagi, your personal concierge for KAMITSUBAKI STUDIO. It's truly a pleasure.\n\nAsk me anything about our talents, live events, or the anime — I'll gladly guide you through it~",
    suggestions: ['What is V.W.P?', 'When is KAMITSUBAKI WARS 2026?', 'Who is KAF?', "What's the Kamitsubaki City anime about?"],
    errorPrefix: '⚠️ Oh dear, something went wrong: ',
    logTitle: 'Backlog',
  },
  ja: {
    introSkip: 'スキップ ▸',
    inputPlaceholder: '凪に話しかける...',
    modeGemini: 'Gemini搭載',
    artCaption: 'いかがですか、ご主人様？この衣装は私が選びました~',
    reselectLang: '言語を変更',
    greeting: 'あ、いらっしゃいませ、ご主人様~ 🌙 私は凪、KAMITSUBAKI STUDIOの専属コンシェルジュです。お会いできて光栄です。\n\nタレントやライブ、アニメについて何でも聞いてくださいね~',
    suggestions: ['V.W.Pって何ですか？', 'KAMITSUBAKI WARS 2026はいつ？', '花譜って誰？', 'アニメ『神椿市建設中。』はどんな話？'],
    errorPrefix: '⚠️ 申し訳ございません、問題が発生しました: ',
    logTitle: 'ログ',
  },
};

// ============================================================================
// CHARACTER PORTRAITS — shown on the main screen in place of the old chat
// log whenever the Master asks about a specific talent (the Log button
// already covers full chat history, so that space is better used here).
// Keyed by the talent's Mongo `_id` (same ids used in importKnowledgeBase.mjs
// and returned by api/chat.js as `featuredTalentId`).
//
// TO ADD A NEW CHARACTER LATER: just add one more line below. Nothing else
// needs to change — FeaturedCharacterArt reads from this table directly.
// ============================================================================
const CHARACTER_PORTRAITS = {
  kaf: '/chara_main1_1.png',          // KAF
  rim: '/chara_main2_1.png',          // RIM
  harusaruhi: '/chara_main3_1.png',   // Harusaruhi (Haru)
  isekaijoucho: '/chara_main4_1.png', // Isekaijoucho (Sekai)
  koko: '/chara_main5_1.png',         // KOKO (Rinne)
  // kafu: '/chara_main6_1.png',      // <- example: next character goes here
};

// ============================================================================
// CHAT — sends the query to api/chat.js, which does retrieval (MongoDB)
// and generation (Gemini) server-side. The client never sees the Gemini
// API key or touches the knowledge base directly.
// ============================================================================
async function askNagi(query, lang, history) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      lang,
      history: history.slice(-6).map((h) => ({ role: h.role, text: h.text })),
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data; // { text, featuredTalentId }
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
      const { text: replyText, featuredTalentId } = await askNagi(q, lang, newMessages);
      if (featuredTalentId && CHARACTER_PORTRAITS[featuredTalentId]) {
        setFeaturedCharacter(featuredTalentId);
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
                <div className="text-[11px] text-gray-400">{L.modeGemini}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowLog(true)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300" title={L.logTitle}><History size={16} /></button>
              <button onClick={backToLanguage} className="p-2 rounded-lg hover:bg-white/10 text-gray-300" title={L.reselectLang}><Globe size={16} /></button>
              <button onClick={() => setShowArt(true)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300" title="Art"><ImageIcon size={16} /></button>
            </div>
          </div>

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

                {/* ADV control column — Skip / Log / Auto */}
                <div className="hidden sm:flex flex-col justify-end gap-2 pb-1">
                  <button onClick={handleSkip} className="adv-btn" title="Skip through the current message">Skip</button>
                  <button onClick={() => setShowLog(true)} className="adv-btn">Log</button>
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