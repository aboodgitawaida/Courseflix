import { useEffect, useState } from "react";

export function CinematicIntro() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const letters = "Courseflix".split("");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background intro-fade">
      <div className="absolute inset-0 intro-bg" />
      
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-brand/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-none tracking-widest text-brand">
          {letters.map((letter, index) => (
            <span
              key={index}
              className="wordmark-letter inline-block"
              style={{
                animationDelay: `${index * 0.08}s`,
                textShadow: '0 0 40px var(--brand), 0 0 80px var(--brand), 0 0 120px var(--brand)',
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <div className="absolute inset-0 intro-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        
        {/* Additional sweep layers */}
        <div className="absolute inset-0 intro-sweep bg-gradient-to-r from-transparent via-brand/20 to-transparent" style={{ animationDelay: '0.2s' }} />
        <div className="absolute inset-0 intro-sweep bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}
