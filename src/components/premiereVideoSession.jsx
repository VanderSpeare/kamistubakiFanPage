import { createContext, useContext, useState, useEffect } from "react";

const PremiereVideoContext = createContext(null);

export function PremiereVideoProvider({ children }) {
  const [videoId, setVideoId] = useState(null);

  const openVideo = (id) => {
    setVideoId(id);
  };

  const closeVideo = () => {
    setVideoId(null);
  };

  // Lock scroll khi mở
  useEffect(() => {
    document.body.style.overflow = videoId ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [videoId]);

  // ESC để đóng
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") closeVideo();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <PremiereVideoContext.Provider
      value={{ videoId, openVideo, closeVideo }}
    >
      {children}
      {videoId && (
        <VideoModal videoId={videoId} onClose={closeVideo} />
      )}
    </PremiereVideoContext.Provider>
  );
}

export function usePremiereVideo() {
  return useContext(PremiereVideoContext);
}
