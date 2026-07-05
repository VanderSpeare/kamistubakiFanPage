import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Marquee from 'react-fast-marquee';
import { useAuth } from '../context/AuthContext';
import { usePremiereVideo } from '../components/premiereVideoSession' ;
import HomeBackgroundVideo from '../components/HomeBackgroundVideo';
import { createContext, useContext } from 'react';
import About from './About';
import { useEffect, useState, useMemo } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import UpcomingEventsSection from '../components/UpcomingEventsSection';
import NewsSection from '../components/NewsSection';  

const baseText =
"/.@, .@ %. ( /.  .#. . ,% / ( ( # # , #, , # % .( ,( ,((@ ( / . . (@ % ##( . . 　　(% , % .( ,( ,((@ ( / (@ % ##( . . 　　(% /.@, .@ %. .. (% , % .( ,( ,((@ ( / (@ % ##( . . (% , % .( ,( ,((@ ( / (@ % ##( . .(% , % .( ,( ,((@ ( / (@ % ##( . .";

const glitchChars = "/.@%#(),";
const sections = ['HOME', 'STORY', 'CHARACTERS', 'STAFF & CAST','MUSIC', 'PRODUCT', 'NEWS'];


const characters = [
  { name: 'KAF', img: 'https://kamitsubaki-anime.jp/assets/img/chara/kaf.png', model: 'https://kamitsubaki-anime.jp/assets/img/chara/kaf_model.png' },
  { name: 'RIM', img: 'https://kamitsubaki-anime.jp/assets/img/chara/rim.png', model: 'https://kamitsubaki-anime.jp/assets/img/chara/rim_model.png' },
  { name: 'HARUNA', img: 'https://kamitsubaki-anime.jp/assets/img/chara/haruna.png', model: 'https://kamitsubaki-anime.jp/assets/img/chara/haruna_model.png' },
  { name: 'ISEKA', img: 'https://kamitsubaki-anime.jp/assets/img/chara/iseka.png', model: 'https://kamitsubaki-anime.jp/assets/img/chara/iseka_model.png' },
];
function DataFlowLine({ phase = 0 }) {
  const [offset, setOffset] = useState(phase);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => (prev + 8) % baseText.length);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const longText = baseText.repeat(10 );
  const visible = longText.slice(offset, offset + 180);
  return <p className="data-line">{visible}</p>;
}
function DataFlow() {
  return (
    <div className="story-dataflow pointer-events-none mt-28 overflow-hidden">
      <DataFlowLine phase={0} />
      <DataFlowLine phase={20} />
      <DataFlowLine phase={40} />
    </div>
  );
}
// Component Hero text shuffle riêng biệt (3 dòng fade in/out stagger)
const HeroShuffleText = ({ sectionId }) => {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: false });

  useEffect(() => {
    if (inView) {
      const texts = document.querySelectorAll(`#${sectionId} .js-shuffleTxt`);
      texts.forEach((txt, index) => {
        setTimeout(() => {
          txt.classList.add('animate');
        }, index * 2500); // stagger: 0s → 2.5s → 5s
      });
    }
  }, [inView, sectionId]);

  return (
    <div ref={ref} className="relative z-40 text-center max-w-5xl mt-32 mb-20">
      <div className="space-y-6">
       
      </div>
    </div>
  );
};

// Component tái sử dụng cho mỗi section (đám mây + poster + hero text + nội dung + ticker)
const SectionHero = ({ id, title, subtitle, children, className = "" }) => {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const { scrollY } = useScroll();
  const cloudY = useTransform(scrollY, [0, 1000], [0, -150]);
  const posterY = useTransform(scrollY, [0, 1000], [0, -100]);
  
  // Hero text shuffle effect (ký tự ngẫu nhiên chạy)
  useEffect(() => {
    if (inView) {
      const shuffleTexts = document.querySelectorAll(`#${id} .js-shuffleTxt`);
      shuffleTexts.forEach((txt, index) => {
        setTimeout(() => {
          txt.classList.add('animate');
        }, index * 2500); // Dòng 1: 0s, dòng 2: 2.5s, dòng 3: 5s
      });
    }
  }, [inView, id]);

  return (
    <section
      id={id}
      ref={ref}
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden
        py-12 px-4
        sm:py-16 sm:px-6
        md:py-20 md:px-10
        lg:py-24 lg:px-16
        xl:px-24
        2xl:px-32
        ${className}`}
    >
      {/* Poster nền dọc di chuyển nhẹ */}
      

      {/* Tiêu đề section */}
      <div className="relative z-10 text-center max-w-5xl">
        <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-12">{title}</h2>
        <p className="text-xl sm:text-2xl md:text-3xl opacity-80 mb-16">{subtitle}</p>
      </div>

      {/* Nội dung section chính */}
      <div className="relative z-20 w-full max-w-7xl mx-auto">
        {children}
      </div>

      {/* Hero text shuffle 3 dòng - nằm cuối section */}
      <HeroShuffleText sectionId={id} />


    </section>
  );
};


export default function Landing() {
  const { loginWithGoogle } = useAuth();
  const [selectedChar, setSelectedChar] = useState(null);
  const { scrollY } = useScroll();
  const cloudY1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const cloudY2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const posterY = useTransform(scrollY, [0, 1000], [0, -150]);
  const [clickStage, setClickStage] = React.useState(0); 
  const [activeId, setActiveId] = useState(1);
  const [visualIndex, setVisualIndex] = useState(1); // 1 hoặc 2
  const { openVideo } = usePremiereVideo();
  const navigate = useNavigate();
  
  
  const characters = [
  {
    id: 1,
    name: "森先 化歩",
    nameRomaji: "KAFU MORISAKI",
    cv: "花譜",
    role: "Witch's Daughter",
    description: "壊れた世界を再生する歌声を持つ、五人の魔女の娘の一人。性格は明るく元気。自分が理不尽だと思った事には立ち向かう。",
    color: "#c1121f",
    accent: "#ff6b6b",
    glow: "rgba(255,0,0,0.35)",
  },
  {
    id: 2,
    name: "谷置 狸眼",
    nameRomaji: "RIME TANIOKI",
    cv: "理芽",
    role: "Witch's Daughter",
    description: "性格は理知的でアクティブ。聡明かつ努力家だが、繊細な心を持っている。ほぼパーフェクトガール。",
    color: "#1d3fad",
    accent: "#7b9cff",
    glow: "rgba(34,68,255,0.35)",
  },
  {
    id: 3,
    name: "朝主 派流",
    nameRomaji: "HARU ASANUSHI",
    cv: "春猿火",
    role: "Witch's Daughter",
    description: "性格は感情豊かで愛情深い。何事にも一生懸命で、エネルギッシュな努力家。本来は内気で傷つきやすい。",
    color: "#c96b00",
    accent: "#ffb347",
    glow: "rgba(255,136,0,0.35)",
  },
  {
    id: 4,
    name: "夜河 世界",
    nameRomaji: "SEKAI YORUKAWA",
    cv: "ヰ世界情緒",
    role: "Witch's Daughter",
    description: "生まれつき、未来を予見する不思議な力を持っていた。一見自我が稀薄そうだが、意志は強い。",
    color: "#5a0ea8",
    accent: "#c084fc",
    glow: "rgba(136,0,255,0.35)",
  },
  {
    id: 5,
    name: "輪廻 此処",
    nameRomaji: "KOKO RINNE",
    cv: "幸祜",
    role: "Witch's Daughter",
    description: "性格は凛としていて大人っぽい。半面かなり天然で、おっちょこちょいなところがある。何かとギャップの多い少女。",
    color: "#0e7f78",
    accent: "#6ef5ec",
    glow: "rgba(0,255,238,0.35)",
  },
  ];
  
  return (
    
    <div 
      className="relative text-white overflow-hidden min-h-screen"
      style={{
        backgroundImage: "url('https://kamitsubaki-anime.jp/assets/img/common/bg_bldg-s.png')",
        backgroundSize: 'filled',              // hoặc '100% auto' nếu muốn giữ tỷ lệ gốc
        backgroundPosition: 'bottom',     // căn trên cùng để khi scroll xuống, ảnh lộ dần từ trên
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll' // fixed để hình nền không cuộn theo (giống trang gốc)
      }}
    >
      
      

      {/* Đám mây parallax - scale theo màn hình */}
      <motion.div style={{ y: cloudY1 }} className="fixed top-10 left-0 w-full opacity-30 pointer-events-none">
        <img src="public/hero_bg-cloud__l.png" alt="cloud" className="w-full max-w-4xl" />
      </motion.div>
      <motion.div style={{ y: cloudY2 }} className="fixed top-20 right-0 w-full opacity-20 pointer-events-none">
        <img src="public/hero_bg-cloud__r.png" alt="cloud" className="w-full max-w-3xl ml-auto" />
      </motion.div>

      {/* Right Sidebar - chỉ hiện trên lg (desktop) */}
      <nav className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <ul className="space-y-6 sm:space-y-8 text-right">
          {sections.map((sec, i) => (
            <motion.li
              key={sec}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <a href={`#${sec.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-sm sm:text-lg hover:text-red-600 transition font-light tracking-widest">
                {sec}
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>

{/* HOME Section - poster nền + tiêu đề + nút đăng nhập */}



<SectionHero
  id="home"
  className="h-screen"
>

{/* 🎬 Background Video */}
<div className="absolute inset-0 z- 0 overflow-hidden pointer-events-none">

  <div className="absolute top-1/2 left-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2">

    <iframe
      className="w-full h-full"
      src="https://www.youtube.com/embed/Kua1N1PJD6k?autoplay=1&mute=1&controls=0&loop=1&playlist=Kua1N1PJD6k&modestbranding=1&rel=0"
      title="Home Background"
      frameBorder="0"
      allow="autoplay; fullscreen"
    />

  </div>
</div>

  {/* 🎥 Cinematic dark overlay */}
  <div className="absolute inset-0 z- 10 bg-black/60 pointer-events-none" />

  {/* 🖼 Poster parallax */}
  <motion.div
    style={{ y: posterY }}
    className="absolute inset-0 z-2"
  >
    
  </motion.div>

  {/* 📝 Content */}
  <div className="relative z- 10000 text-center text-white">
    <motion.img
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5 }}
      src="public\DaiiTri.png"
      alt="Logo"
      className="mx-auto mb-6 w-10 sm:w-16 md:w-24"
    />
  
    <motion.h1
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-widest leading-tight"
    >
      神椿市建設中。
    </motion.h1>

    <motion.p
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
      className="text-lg sm:text-2xl md:text-4xl mt-4 opacity-80"
    >
      KAMITSUBAKI CITY UNDER CONSTRUCTION.
    </motion.p>

    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 1.1 }}
      className="mt-8 sm:mt-12"
      
    >
    <div className="explore-btn-wrapper">
      <img
        src="/link_toContent.svg"
        alt="Explore"
        className="explore-btn"
        onClick={() => {
          document
            .getElementById("story")
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
        }}
      />
      
    </div> 
    </motion.div>
  </div>
</SectionHero>
<DataFlow />
 {/*<motion.div style={{ y: posterY }} className="absolute inset-1 opacity-40 pointer-events-none">
        <img src="public/hero_bg-s.jpg" alt="Poster" className="w-full h-full object-cover" />
      </motion.div>

      
      <motion.div style={{ y: cloudY }} className="absolute top-0 left-0 w-full opacity-30 pointer-events-none">
        <img src="public/hero_bg-cloud__l.png" alt="cloud left" className="w-1/2" />
      </motion.div>
      <motion.div style={{ y: cloudY }} className="absolute top-20 right-0 w-full opacity-20 pointer-events-none">
        <img src="public/hero_bg-cloud__r.png" alt="cloud right" className="w-1/2 ml-auto" />
      </motion.div> */ }        
{/* STORY - Dùng SectionHero + text kể chuyện + video trailer */}
<SectionHero 
  id="story" >
  <div className="text-center max-w-4xl mx-auto">
  <img 
  src="/story_h2.svg" 
  alt="Story Header"
  className="
      absolute
    -top-32
    left-0
    w-[50%]
    max-w-none
    opacity-30
    pointer-events-none
  "
/>
  
      
  <div className="relative group">
     
    
    <div className="
      absolute -inset-7
      rounded-2xl
      bg-gradient-to-r from-red-700 via-red-500 to-red-700
      blur-2xl
      opacity-100
      transition-all duration-600
      group-hover:opacity-70
      group-hover:blur-[60px]
    "></div>

    
    <div
      onClick={() => openVideo("VMkIQ3gD494")}
      className="
        relative z-10
        cursor-pointer
        rounded-2xl
        overflow-hidden
        shadow-2xl
        border border-red-600/30
        transition-all duration-500
        group-hover:scale-[1.02]
      "
    >
      <iframe
        src="https://www.youtube.com/embed/VMkIQ3gD494?mute=1"
        title="Preview"
        className="w-full aspect-video"
        allowFullScreen
      />
    </div>

  </div>
  <div className="mt-20 relative inline-block group z-50">

  {/* Glow */}
  <div
    className="
    absolute inset-0
    rounded-full
    bg-red-600
    blur-2xl
    opacity-45
    transition-all duration-500
    group-hover:opacity-70
    pointer-events-none
  "
  />

  <button
    onClick={() => {
      console.log("clicked");
      navigate("/teams");
    }}
    className="
      relative z-50
      px-16 py-5
      text-sm tracking-[0.35em] font-semibold text-white
      bg-gradient-to-r from-black via-[#330000] to-red-700
      border border-red-600/40
      transition-all duration-500 ease-out
      shadow-[0_0_15px_rgba(255,0,0,0.25)]
      hover:shadow-[0_0_35px_rgba(255,0,0,0.6)]
      hover:text-red-500 hover:tracking-[0.45em] hover:scale-105
    "
  >
    VIEW MORE
  </button>
  
  
  </div>

  </div>
</SectionHero>
<DataFlow />


{/* CHARACTER Section - poster nền + info nhân vật + thumbnail chọn nhân vật + visual chính nổi lên trên */}
<SectionHero id="characters" className="relative overflow-hidden min-h-screen">

  {/* ================================================================
      LỚP 1 - BACKGROUND: chara_main.webp + thumbnail row (giữ nguyên)
  ================================================================ */}

  {/* BG mờ */}
  <AnimatePresence mode="wait">
    <motion.div
      key={`bg-${activeId}`}
      className="absolute inset-0 -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <img
        src={`/chara${activeId ?? 1}_main.webp`}
        className="w-full h-full object-cover opacity-20 scale-105 blur-sm"
        alt=""
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
    </motion.div>
  </AnimatePresence>

  {/* Layout nền: ảnh webp lớn bên trái + info + thumbnail row */}
  <div className="relative flex flex-col lg:flex-row items-center lg:items-end gap-8 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-12 sm:pt-16 pb-8 min-h-screen">

    {/* Ảnh chara_main.webp — bên trái, mờ hơn vì sẽ bị đè */}
    <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-start flex-shrink-0">
      <AnimatePresence mode="wait">
        <motion.img
          key={`webp-${activeId}`}
          src={`/chara${activeId ?? 1}_main.webp`}
          alt=""
          className="max-h-[65vh] lg:max-h-[75vh] object-contain opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>
    </div>

    {/* Info + Thumbnail row */}
    <div className="w-full lg:w-1/2 flex flex-col gap-8 lg:pb-12 z-10">
      <AnimatePresence mode="wait">
        {(() => {
          const char = characters.find(c => c.id === (activeId ?? 1));
          return char ? (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <p className="text-xs tracking-[0.3em] uppercase text-white/50">CHARACTER</p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-widest text-white">
                {char.name}
              </h2>
              {char.nameRomaji && (
                <p className="text-sm tracking-[0.2em] text-white/60 uppercase">{char.nameRomaji}</p>
              )}
              {char.cv && (
                <p className="text-sm text-white/70">
                  CV: <span className="text-white font-medium">{char.cv}</span>
                </p>
              )}
              {char.description && (
                <p className="text-sm leading-relaxed text-white/70 max-w-md">{char.description}</p>
              )}
            </motion.div>
          ) : null;
        })()}
      </AnimatePresence>

      {/* Thumbnail Row */}
      <div className="flex flex-wrap gap-3">
        {characters.map((char, i) => (
          <motion.button
            key={char.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setActiveId(char.id);
              setVisualIndex(1);
            }}
            className={`relative w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 transition-all duration-300 ${
              (activeId ?? 1) === char.id
                ? "border-white scale-110 shadow-lg shadow-white/20"
                : "border-white/20 hover:border-white/60"
            }`}
          >
            <img
              src={`/chara${char.id}_thumb-hv.jpg`}
              alt={char.name}
              className="w-full h-full object-cover"
            />

            {(activeId ?? 1) === char.id && (
              <motion.div
                layoutId="activeThumb"
                className="absolute inset-0 ring-2 ring-white ring-offset-1 ring-offset-black/50 rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  </div>

{/* ================================================================
    LỚP 2 - NỔI LÊN TRÊN: Visual 1/2 switch, đè lên lớp nền
================================================================ */}
<div className="absolute inset-0 z-20 pointer-events-none flex items-end">
  <div className="relative w-full max-w-7xl mx-auto px-6 pb-8 pointer-events-auto">

    {/* ---- Ảnh Visual nổi, lệch trái -16 ---- */}
    <div className="absolute bottom-8 -left-16 w-[75%] lg:w-[60%] flex flex-col items-start">

      <AnimatePresence mode="wait">
        <motion.img
          key={`vis-${activeId}-${visualIndex}`}
          src={`/chara_main${activeId ?? 1}_${visualIndex}.png`}
          alt={characters.find(c => c.id === (activeId ?? 1))?.name}
          className="w-full max-h-[90vh] object-contain object-bottom drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          initial={{ opacity: 0, x: visualIndex === 1 ? -30 : 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: visualIndex === 1 ? 30 : -30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </AnimatePresence>

      {/* Visual Switch Controls */}
      <div className="flex items-center gap-3 mt-4 pl-16">
        {[1, 2].map((v) => (
          <button
            key={v}
            onClick={() => setVisualIndex(v)}
            className={`relative transition-all duration-300 ${
              visualIndex === v ? "scale-100" : "scale-90 opacity-50 hover:opacity-80"
            }`}
          >
            <div className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              visualIndex === v ? "border-white shadow-lg shadow-white/30" : "border-white/20"
            }`}>
              <img
                src={`/chara_main${activeId ?? 1}_${v}.png`}
                alt={`Visual ${v}`}
                className="w-full h-full object-cover object-top"
              />
              {visualIndex !== v && <div className="absolute inset-0 bg-black/40" />}
            </div>
            <p className={`mt-1 text-center text-[10px] tracking-widest uppercase transition-colors duration-300 ${
              visualIndex === v ? "text-white" : "text-white/40"
            }`}>
              Ver.{v}
            </p>
          </button>
        ))}

        <button
          onClick={() => setVisualIndex(v => v === 1 ? 2 : 1)}
          className="group ml-2 flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-white/60 transition-all duration-300 hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-white/60 group-hover:text-white transition-all duration-300 group-hover:rotate-180"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-xs tracking-widest text-white/60 group-hover:text-white transition-colors duration-300 uppercase">
            Visual
          </span>
        </button>
      </div>
    </div>

    {/* ================================================================
        NÚT CHUYỂN NHÂN VẬT 2 BÊN
        - Nằm giữa chiều dọc, cố định 2 mép
    ================================================================ */}
    {/* Nút PREV */}
    <button
      onClick={() => {
        const currentIndex = characters.findIndex(c => c.id === (activeId ?? 1));
        const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
        setActiveId(characters[prevIndex].id);
        setVisualIndex(1);
      }}
      className="absolute left-4 top-1/2 -translate-y-1/2 group flex flex-col items-center gap-3 z-30"
    >
      <div className="w-14 h-20 rounded-lg border border-white/20 flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-sm group-hover:border-white/60 group-hover:bg-white/10 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/60 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-[9px] tracking-[0.15em] text-white/40 group-hover:text-white/80 transition-colors duration-300 uppercase">Prev</span>
      </div>

      {/* Preview nhân vật kế */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/30">
          <img
            src={`/chara${(() => {
              const i = characters.findIndex(c => c.id === (activeId ?? 1));
              return characters[(i - 1 + characters.length) % characters.length]?.id;
            })()}_thumb.jpg`}
            className="w-full h-full object-cover"
            alt="prev"
          />
        </div>
        <p className="text-[9px] text-white/50 text-center tracking-widest">
          {(() => {
            const i = characters.findIndex(c => c.id === (activeId ?? 1));
            return characters[(i - 1 + characters.length) % characters.length]?.name;
          })()}
        </p>
      </div>
    </button>

    {/* Nút NEXT */}
    <button
      onClick={() => {
        const currentIndex = characters.findIndex(c => c.id === (activeId ?? 1));
        const nextIndex = (currentIndex + 1) % characters.length;
        setActiveId(characters[nextIndex].id);
        setVisualIndex(1);
      }}
      className="absolute right-4 top-1/2 -translate-y-1/2 group flex flex-col items-center gap-3 z-30"
    >
      <div className="w-14 h-20 rounded-lg border border-white/20 flex flex-col items-center justify-center gap-2 bg-black/30 backdrop-blur-sm group-hover:border-white/60 group-hover:bg-white/10 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/60 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[9px] tracking-[0.15em] text-white/40 group-hover:text-white/80 transition-colors duration-300 uppercase">Next</span>
      </div>

      {/* Preview nhân vật kế */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/30">
          <img
            src={`/chara${(() => {
              const i = characters.findIndex(c => c.id === (activeId ?? 1));
              return characters[(i + 1) % characters.length]?.id;
            })()}_thumb.jpg`}
            className="w-full h-full object-cover"
            alt="next"
          />
        </div>
        <p className="text-[9px] text-white/50 text-center tracking-widest">
          {(() => {
            const i = characters.findIndex(c => c.id === (activeId ?? 1));
            return characters[(i + 1) % characters.length]?.name;
          })()}
        </p>
      </div>
    </button>
  </div>
</div>
</SectionHero>
{/* STAFF & CAST - Dùng SectionHero */}
<SectionHero id="staff-cast" title="STAFF & CAST" subtitle=" The Team Behind Kamitsubaki">
   {/* Story-only Clouds */}
  <motion.div
    style={{ y: cloudY1 }}
    className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
  >
    <img
      src="/hero_bg-cloud__l.png"
      alt=""
      className="center -left-24 w-[55%] opacity-25"
    />
  </motion.div>

  <motion.div
    style={{ y: cloudY2 }}
    className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
  >
    <img
      src="/hero_bg-cloud__r.png"
      alt=""
      className="center "
    />
  </motion.div>

  <img
    src="/introduction_bg-tit.svg"
    alt="Story Header"
    className="
      absolute
      -bottom-32
      left-0
      w-[50%]
      max-w-none
      opacity-60
      pointer-events-none
      z-10
    "
  />
  <img 
    src="/introduction_bg-tit.svg" 
    alt="Story Header"
    className="
        absolute
      -bottom-32
      left-0
      w-[50%]
      max-w-none
      opacity-60
      pointer-events-none
    "
  />
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl w-full">
    {[
      { role: 'Original Creator', name: 'KAMITSUBAKI STUDIO', desc: 'Producer & World Building', onClick: () => window.open('https://www.kamitsubaki.com', '_blank') },
      { role: 'Director', name: 'Tetsuya Yamamoto', desc: 'Known for virtual singer projects', onClick: () => window.open('https://kamitsubaki.studio/en/artist/', '_blank') },
      { role: 'Character Design', name: 'PALOW', desc: 'Famous VTuber & anime illustrator', onClick: () => window.open('https://kamitsubaki.studio/en/artist/palow/', '_blank') },
      { role: 'Music Producer', name: 'TAKU INOUE', desc: 'Composer for KAF, RIM, etc.', onClick: () => window.open('https://taku-inoue.com/', '_blank') },
      { role: 'Animation Studio', name: 'Graphinica × WIT STUDIO', desc: 'High-quality anime production', onClick: () => window.open('https://www.graphinica.com/en/', '_blank') },
      { role: 'Voice Actor - KAF', name: 'KAF (Virtual Singer)', desc: 'Main heroine voice', onClick: () => window.open('https://yokohamawars2026.kamitsubaki.jp/kaf', '_blank') },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ scale: 1.05 }}
        onClick={item.onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') item.onClick(); }}
        className="bg-white/5 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 hover:border-white/30 cursor-pointer transition-colors"
      >
        <p className="text-sm text-gray-400 mb-2">{item.role}</p>
        <h3 className="text-2xl font-bold mb-3">{item.name}</h3>
        <p className="text-gray-300 text-sm">{item.desc}</p>
      </motion.div>
    ))}
  </div>
</SectionHero>
      <DataFlow />
      {/* MUSIC - Dùng SectionHero */}
      <SectionHero id="music" title="MUSIC" subtitle="Music of Kamitsubaki">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl">
          {[
            { title: 'Opening Theme', song: '"Construction"', artist: 'KAF', yt: 'https://www.youtube.com/watch?v=example1' },
            { title: 'Ending Theme', song: '"City Lights"', artist: 'RIM', yt: 'https://www.youtube.com/watch?v=example2' },
            { title: 'Insert Song', song: '"Virtual Dream"', artist: 'HARUNA', yt: 'https://www.youtube.com/watch?v=example3' },
          ].map((track, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.08 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10"
            >
              <div className="bg-gradient-to-br from-purple-900 to-black h-64 flex items-center justify-center">
                <span className="text-6xl">🎵</span>
              </div>
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400 mb-2">{track.title}</p>
                <h3 className="text-2xl font-bold mb-2">{track.song}</h3>
                <p className="text-lg text-gray-300 mb-6">by {track.artist}</p>
                <a href={track.yt} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-red-600 rounded-full hover:bg-red-700 transition">
                  Listen on YouTube
                </a>
              </div>
            </motion.div>
          ))}
        </div>
        
      </SectionHero>
        {/*PRODUCT - Dùng SectionHero */}
        <SectionHero id="product" title="PRODUCT" subtitle="Merchandise & Goods">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl">
             
               {[
                  { image: '/merch1.webp', title: 'Isekaijoucho Hoodie', desc: 'Premium streetwear inspired by the Isekaijoucho world.', price: '549,000₫' },
                  { image: '/merch2.webp', title: 'Kamitsubaki City T-Shirt', desc: 'Everyday tee featuring the Kamitsubaki City emblem.', price: '289,000₫' },
                  { image: '/merch3.webp', title: 'Mini Character Standee', desc: 'Collectible acrylic standees of your favorite characters.', price: '159,000₫' },
                  { image: '/merch4.webp', title: 'Kamitsubaki Studio Notebook', desc: 'Bound notebook for daily notes and lyrics.', price: '75,000₫' },
                  { image: '/merch1.webp', title: 'Character Print Poster', desc: 'High-resolution poster prints, A2/A3 sizes.', price: '99,000₫' },
                  { image: '/merch2.webp', title: 'Canvas Tote Bag', desc: 'Durable canvas tote for everyday carry.', price: '149,000₫' },
                ].map((product, i) => (
                  <motion.article
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-bold mb-3">{product.title}</h3>
                      <p className="text-gray-300 mb-4">{product.desc}</p>
                      <span className="text-red-400 font-semibold tracking-wide">{product.price}</span>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* STORE PAGE button */}
              <div className="flex justify-center">
                <div className="mt-20 relative inline-block group z-50">
                  {/* Glow */}
                  <div
                    className="
                      absolute inset-0
                      rounded-full
                      bg-red-600
                      blur-2xl
                      opacity-45
                      transition-all duration-500
                      group-hover:opacity-70
                      pointer-events-none
                    "
                  />
                  <button
                    onClick={() => navigate('/Services')}
                    className="
                      relative z-50
                      px-16 py-5
                      text-sm tracking-[0.35em] font-semibold text-white
                      bg-gradient-to-r from-black via-[#330000] to-red-700
                      border border-red-600/40
                      transition-all duration-500 ease-out
                      shadow-[0_0_15px_rgba(255,0,0,0.25)]
                      hover:shadow-[0_0_35px_rgba(255,0,0,0.6)]
                      hover:text-red-500 hover:tracking-[0.45em] hover:scale-105
                    "
                  >
                    STORE PAGE
                  </button>
                </div>
              </div>
</SectionHero>       
        {/* NEWS - Dùng SectionHero */}
        <UpcomingEventsSection />
        <NewsSection />
        <DataFlow />
      {/* Footer Ticker */}
        <footer className="w-full bg-black/80 backdrop-blur-md py-2 mt-20">
          <Marquee gradient={false} speed={80}>
            <span className="mx-8 text-xs sm:text-sm tracking-wider">
              KAMITSUBAKI CITY UNDER CONSTRUCTION • 神椿市建設中。 • COMING SOON 2026
            </span>
          </Marquee>

          <Marquee gradient={false} speed={60} direction="right">
            <span className="mx-8 text-xs sm:text-sm tracking-wider">
              VIRTUAL SINGER PROJECT • ANIME & MUSIC
            </span>
          </Marquee>

          <Marquee gradient={false} speed={70}>
            <span className="mx-8 text-xs sm:text-sm tracking-wider">
              © KAMITSUBAKI STUDIO • ALL RIGHTS RESERVED
            </span>
          </Marquee>
        </footer>
    </div>
  );
}

