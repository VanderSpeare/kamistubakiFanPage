import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useBodyClass from "../hooks/useBodyClass";

const talents = [
  // vị trí 1 ← nhân vật 3 (HARU)
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
  // vị trí 2 ← nhân vật 4 (SEKAI)
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
  // vị trí 3 ← nhân vật 1 (KAFU)
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
  // vị trí 4 ← nhân vật 2 (RIME)
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
  // vị trí 5 ← nhân vật 5 (KOKO) — giữ nguyên
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

export default function Teams() {
  const navigate = useNavigate();

  // Thêm class "page-teams" vào <body> khi trang này mount.
  // index.css dùng class này để ẩn .base-black, .bottom-image,
  // .bottom-color của Landing — tránh che mất top_visual_2.jpg
  useBodyClass("page-teams");

  const [active, setActive] = useState(null);
  const [visualIndex, setVisualIndex] = useState(1);

  const handleClick = (id) => {
    setActive((prev) => (prev === id ? null : id));
    setVisualIndex(1);
  };

  return (
    <>
      {/* ── Global CSS reset ── */}
      <style>{`
        html, body, #root { margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%; box-sizing: border-box; }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      {/* ════════════════════════════════════════════════════════════
          CONTAINER CHÍNH — flex ngang chứa 5 panel
          background: "transparent" để thấy .bottom-image từ
          layout global (App.jsx / index) phía sau.
      ════════════════════════════════════════════════════════════ */}
      <div
        
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -1,           /* -1 là đủ khi nằm ngoài stacking context */
            pointerEvents: "none",
            color: "rgba(55, 55, 55, 0.15)",
          }}
        >
          {/* Ảnh nền /top_visual_2.jpg — phủ toàn màn hình, căn bottom */}
          <img
            src="/top_visual_2.jpg"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "bottom center",
              display: "block",
            }}
            draggable={false}
          />
          {/* Overlay tối nhẹ giúp panel phía trên dễ đọc */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(128, 125, 125, 0.4)",
            }}
          />
        </div>

        {/* ════════════════════════════════════════════════════════════
            CONTAINER CHÍNH — flex ngang chứa 5 panel
            background: "transparent" để thấy global bg phía sau.
            zIndex: 0 (không tạo stacking context cản global bg).
        ════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "row",
            background: "transparent",   /* ← trong suốt, không che global bg */
            fontFamily: "'Noto Serif JP', serif",
            overflow: "hidden",
            zIndex: 0,
          }}
      >
        {/* ── Nút Back ── */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${active ? talents.find(c => c.id === active)?.accent + "55" : "rgba(255,255,255,0.2)"}`,
              background: "rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
            Back
          </span>
        </button>

        {/* ════════════════════════════════════════════════════════
            5 PANELS — accordion ngang
            flexBasis:0 + flexShrink:1 → tổng luôn = 100% width
        ════════════════════════════════════════════════════════ */}
        {talents.map((char, i) => {
          const isActive = active === char.id;
          const isCollapsed = active !== null && !isActive;

          return (
            <motion.div
              key={char.id}
              onClick={() => handleClick(char.id)}
              animate={{ flexGrow: isActive ? 5 : isCollapsed ? 0.35 : 1 }}
              transition={{ duration: 0.65, ease: [0.77, 0, 0.18, 1] }}
              style={{
                flexBasis: 0,
                flexShrink: 1,
                minWidth: 0,
                height: "100%",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                borderRight: i < talents.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              {/* TẦNG 1 — Ảnh đại diện nhân vật (chara_main{id}_1.png)
                  Collapsed: opacity 0.65 | Active: 0.80 */}
              {/* TẦNG 1 — ảnh nền đồng bộ với visualIndex của tầng 5B
                  Khi nhấn Ver.1/Ver.2 → cả ảnh nổi lẫn ảnh nền cùng đổi */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={`bg-${char.id}-${isActive ? visualIndex : 1}`}
                  src={`/chara_main${char.id}_${isActive ? visualIndex : 1}.png`}
                  alt=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top center",
                    opacity: isActive ? 1 : 1,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 1 : 0.65 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  draggable={false}
                />
              </AnimatePresence>

              {/* TẦNG 2 — Color tint (radial gradient màu nhân vật) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at 30% 60%, ${char.color}${isActive ? "55" : "33"} 0%, transparent 70%)`,
                  transition: "background 0.65s",
                  pointerEvents: "none",
                }}
              />

              {/* TẦNG 3 — Dark vignette (readability)
                  Active: gradient ngang | Collapsed: tối đều nhẹ (0.38) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isActive
                    ? "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.05) 100%)"
                    : "rgba(0,0,0,0.38)",
                  transition: "background 0.65s",
                  pointerEvents: "none",
                }}
              />
              {/* Gradient chân trang */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* TẦNG 4 — Accent stripe (thanh màu 3px bên trái) */}
              <div
                style={{
                  position: "absolute",
                  left: 0, top: 0,
                  width: 3, height: "100%",
                  background: `linear-gradient(to bottom, transparent 5%, ${char.accent}${isActive ? "cc" : "55"} 35%, ${char.accent}${isActive ? "cc" : "55"} 65%, transparent 95%)`,
                  transition: "background 0.4s",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />

              {/* TẦNG 5A — Collapsed: avatar + tên dọc + số */}
              <AnimatePresence>
                {!isActive && (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 12,
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      overflow: "hidden", border: `2px solid ${char.accent}70`, flexShrink: 0,
                    }}>
                      <img
                        src={`/chara${char.id}_thumb-hv.jpg`}
                        alt={char.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        draggable={false}
                      />
                    </div>
                    <span style={{
                      fontSize: 10, letterSpacing: "0.35em",
                      textTransform: "uppercase", fontWeight: 600,
                      color: char.accent, opacity: 0.85,
                      writingMode: "vertical-rl", textOrientation: "mixed", whiteSpace: "nowrap",
                    }}>
                      {char.nameRomaji}
                    </span>
                    <span style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TẦNG 5B — Expanded: PNG nổi + visual switch + info + thumbnails */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: 0.18 }}
                    style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      display: "flex", alignItems: "flex-end", overflow: "hidden",
                    }}
                  >
                    {/* Ảnh PNG nhân vật nổi */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0,
                      width: "50%", maxWidth: 480,
                      pointerEvents: "none", zIndex: 2,
                    }}>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={`${char.id}-${visualIndex}`}
                          src={`/chara_main${char.id}_${visualIndex}.png`}
                          alt={char.name}
                          style={{
                            width: "100%", maxHeight: "88vh",
                            objectFit: "contain", objectPosition: "bottom",
                            filter: `drop-shadow(0 8px 48px ${char.glow}) drop-shadow(0 0 24px ${char.color}44)`,
                            display: "block",
                          }}
                          initial={{ opacity: 0, x: -16, scale: 0.96 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 16, scale: 0.96 }}
                          transition={{ duration: 0.42, ease: "easeOut" }}
                          draggable={false}
                        />
                      </AnimatePresence>
                    </div>

                    {/* Visual switch Ver.1 / Ver.2 */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute", bottom: 56, left: 16,
                        zIndex: 20, display: "flex", alignItems: "flex-end", gap: 8,
                      }}
                    >
                      {[1, 2].map((v) => (
                        <button
                          key={v}
                          onClick={() => setVisualIndex(v)}
                          style={{
                            background: "none", border: "none", padding: 0, cursor: "pointer",
                            opacity: visualIndex === v ? 1 : 0.4,
                            transform: visualIndex === v ? "scale(1)" : "scale(0.88)",
                            transition: "all 0.3s",
                          }}
                        >
                          <div style={{
                            width: 44, height: 58, borderRadius: 10, overflow: "hidden",
                            border: `2px solid ${visualIndex === v ? char.accent : "rgba(255,255,255,0.15)"}`,
                            boxShadow: visualIndex === v ? `0 0 16px ${char.color}66` : "none",
                            position: "relative",
                          }}>
                            <img
                              src={`/chara_main${char.id}_${v}.png`}
                              alt={`Ver.${v}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                              draggable={false}
                            />
                            {visualIndex !== v && (
                              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
                            )}
                          </div>
                          <p style={{
                            marginTop: 4, textAlign: "center", fontSize: 8,
                            letterSpacing: "0.2em", textTransform: "uppercase",
                            color: visualIndex === v ? char.accent : "rgba(255,255,255,0.3)",
                          }}>
                            Ver.{v}
                          </p>
                        </button>
                      ))}
                      <button
                        onClick={() => setVisualIndex((v) => (v === 1 ? 2 : 1))}
                        style={{
                          marginBottom: 20, width: 28, height: 28, borderRadius: 8,
                          border: `1px solid ${char.accent}30`, background: "rgba(0,0,0,0.45)",
                          backdropFilter: "blur(6px)", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={char.accent + "cc"} strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>

                    {/* Info panel — nửa phải */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        marginLeft: "auto", width: "48%",
                        paddingRight: 24, paddingBottom: 64,
                        zIndex: 15, display: "flex", flexDirection: "column", gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 24, height: 2, background: char.accent }} />
                        <span style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", fontWeight: 600, color: char.accent }}>
                          Character {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 3rem)", fontWeight: 700, letterSpacing: "0.15em", color: "#fff", lineHeight: 1.2, margin: 0 }}>
                        {char.name}
                      </h2>
                      <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: char.accent + "bb", margin: 0 }}>
                        {char.nameRomaji}
                      </p>
                      <div style={{ width: 56, height: 1, background: char.accent, opacity: 0.3 }} />
                      <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                        {char.role}
                      </p>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                        CV: <span style={{ color: "#fff", fontWeight: 600 }}>{char.cv}</span>
                      </p>
                      <p style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", maxWidth: 260, margin: 0 }}>
                        {char.description}
                      </p>

                      {/* Thumbnail row */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                        {talents.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => c.id !== char.id && handleClick(c.id)}
                            style={{
                              width: 36, height: 36, borderRadius: "50%", overflow: "hidden",
                              border: `2px solid ${char.id === c.id ? char.accent : "rgba(255,255,255,0.12)"}`,
                              boxShadow: char.id === c.id ? `0 0 12px ${char.color}77` : "none",
                              transform: char.id === c.id ? "scale(1.15)" : "scale(1)",
                              transition: "all 0.3s",
                              cursor: c.id === char.id ? "default" : "pointer",
                              background: "none", padding: 0, flexShrink: 0,
                            }}
                          >
                            <img
                              src={`/chara${c.id}_thumb-hv.jpg`}
                              alt={c.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              draggable={false}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hover highlight viền khi collapsed */}
              {!isActive && (
                <div
                  style={{
                    position: "absolute", inset: 0,
                    boxShadow: `inset 0 0 0 1px ${char.accent}00`,
                    transition: "box-shadow 0.3s",
                    pointerEvents: "none", zIndex: 30,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${char.accent}40`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${char.accent}00`; }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}