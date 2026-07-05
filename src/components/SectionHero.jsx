// src/components/SectionHero.jsx
//
// Extracted from Landing.jsx, where it used to be defined inline as a
// local `const SectionHero = ...`. Pulled out into its own file so it can
// be imported by NewsSection.jsx and UpcomingEventsSection.jsx too,
// instead of being duplicated or unreachable from those files.
//
// IMPORTANT: after adding this file, Landing.jsx must:
//   1. Import it:  import SectionHero from '../components/SectionHero';
//   2. DELETE its own local `const HeroShuffleText = ...` and
//      `const SectionHero = ...` definitions (now living here instead) —
//      otherwise you'll have two components with the same name in scope,
//      which either errors or silently shadows this shared one.
import { useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function HeroShuffleText({ sectionId }) {
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
      <div className="space-y-6" />
    </div>
  );
}

// Component tái sử dụng cho mỗi section (đám mây + poster + hero text + nội dung + ticker)
export default function SectionHero({ id, title, subtitle, children, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  // scrollY/cloudY/posterY were computed in the original but never actually
  // applied to anything in the JSX below — kept out here since they were
  // dead code; re-add if you had follow-up changes wiring them into style.
  useScroll();

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
}