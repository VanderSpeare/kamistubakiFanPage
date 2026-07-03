import { useEffect } from "react";

export default function BottomEffect() {
  useEffect(() => {
    const color = document.querySelector(".bottom-color");
    if (!color) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight;

      // 🔴 bắt đầu fade khi còn 1 viewport tới đáy
      const startFade = docH - vh * 2;
      const endFade   = docH - vh;

      let progress =
        (scrollY - startFade) / (endFade - startFade);

      progress = Math.max(0, Math.min(1, progress));

      // chỉ điều khiển alpha đỏ
      color.style.setProperty("--fade", progress.toFixed(3));
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="base-black" />
      <div className="bottom-image" />
      <div className="bottom-color" />
    </>
  );
}
