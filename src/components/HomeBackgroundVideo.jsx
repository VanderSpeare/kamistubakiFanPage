// components/HomeBackgroundVideo.jsx
import React from "react";

export default function HomeBackgroundVideo() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <iframe
        className="w-full h-full object-cover"
        src="https://www.youtube.com/embed/Kua1N1PJD6k?autoplay=1&mute=1&controls=0&loop=1&playlist=Kua1N1PJD6k&modestbranding=1&rel=0"
        title="Home Background"
        frameBorder="0"
        allow="autoplay; fullscreen"
      />
      {/* cinematic dark overlay */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
