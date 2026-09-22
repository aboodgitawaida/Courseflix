import { useEffect, useRef, useState } from "react";
import tudum from "@/assets/tudum.mp3.asset.json";

const SESSION_KEY = "courseflix.intro.played";

export function BrandIntro() {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let played = "1";
    try {
      played = sessionStorage.getItem(SESSION_KEY) ?? "";
    } catch {
      played = "1";
    }
    if (played) return;
    setVisible(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Storage may be unavailable in privacy-restricted browsers.
    }

    const audio = new Audio(tudum.url);
    audio.volume = 0.55;
    audioRef.current = audio;
    void audio.play().catch(() => {});

    const t = window.setTimeout(() => setDone(true), 2600);
    const t2 = window.setTimeout(() => setVisible(false), 3200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      audio.pause();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      onClick={() => setVisible(false)}
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-500 ${
        done ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative">
        <div className="wordmark intro-word font-display text-[15vw] leading-none md:text-[11vw]">
          Courseflix
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="intro-sweep h-full w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
      </div>
    </div>
  );
}
