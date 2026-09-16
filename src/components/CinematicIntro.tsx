import { useEffect, useState, useRef } from "react";

export function CinematicIntro() {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Phase timing sequence
    const phase1 = setTimeout(() => setPhase(1), 600);   // Ambient glow complete
    const phase2 = setTimeout(() => setPhase(2), 1800);  // Wordmark complete
    const phase3 = setTimeout(() => setPhase(3), 2800);  // Ribbons complete
    const hideTimer = setTimeout(() => setVisible(false), 3500);

    // Optional: Try to play "Ta-Dum" sound
    try {
      // You can add an actual audio file here
      // audioRef.current = new Audio('/ta-dum.mp3');
      // audioRef.current.volume = 0.3;
      // audioRef.current.play().catch(() => {});
    } catch (e) {
      // Audio blocked by browser policy - silently fail
    }

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(phase3);
      clearTimeout(hideTimer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const skipIntro = () => {
    setVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black pointer-events-auto cursor-pointer"
      onClick={skipIntro}
    >
      {/* Phase 1: Dark Canvas & Ambient Glow */}
      <div 
        className="absolute inset-0 netflix-ambient"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(127, 29, 29, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Phase 2: Wordmark Convergence */}
      <div className="relative z-10">
        <div className="netflix-wordmark netflix-chromatic">
          <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] leading-none tracking-tight text-brand">
            COURSEFLIX
          </h1>
        </div>

        {/* Light Streak */}
        <div 
          className="absolute inset-0 netflix-streak bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ transform: 'skewX(-20deg)' }}
        />

        {/* Lens Flare */}
        <div className="absolute inset-0 netflix-flare">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/30 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Phase 3: Light Ribbons / Particle Expansion */}
      {phase >= 2 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="netflix-ribbon absolute"
              style={{
                left: `${10 + i * 12}%`,
                width: '2px',
                height: '100%',
                background: `linear-gradient(to bottom, transparent, rgba(229, 9, 20, ${0.3 + i * 0.05}), transparent)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Phase 4: Cinematic Dissolve */}
      <div className={`absolute inset-0 bg-black netflix-dissolve ${phase >= 3 ? 'pointer-events-none' : ''}`} />

      {/* Skip Button */}
      <button 
        className="absolute bottom-8 right-8 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors z-20"
        onClick={(e) => {
          e.stopPropagation();
          skipIntro();
        }}
      >
        Skip Intro
      </button>
    </div>
  );
}
