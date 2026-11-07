"use client";

import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TrailerPlayOverlayProps = {
  title: string;
  trailerUrl?: string;
};

export function TrailerPlayOverlay({ title, trailerUrl }: TrailerPlayOverlayProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const openTrailer = () => {
    if (!trailerUrl || isOpening) return;
    setIsOpening(true);
    window.setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
    }, 420);
  };

  const closeTrailer = () => {
    setIsOpen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fullscreenRef.current?.requestFullscreen?.().catch(() => undefined);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTrailer();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!trailerUrl) return null;

  return (
    <>
      <button
        aria-label="تماشای تریلر"
        className={`absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white transition duration-500 hover:scale-105 ${
          isOpening ? "scale-[2.6] opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={openTrailer}
        type="button"
      >
        <span className="absolute -inset-6 rounded-full border border-white/30 opacity-45 animate-[trailer-idle-wave_3.8s_ease-out_infinite]" />
        <span className="absolute -inset-12 rounded-full border border-white/20 opacity-30 animate-[trailer-idle-wave_5.2s_ease-out_infinite]" />
        <span className="absolute -inset-20 rounded-full border border-white/10 opacity-20 animate-[trailer-idle-wave_6.6s_ease-out_infinite]" />
        <span
          className={`absolute inset-0 rounded-full border border-white/35 ${
            isOpening ? "animate-[trailer-wave_1.45s_ease-out_forwards]" : ""
          }`}
        />
        <span
          className={`absolute -inset-5 rounded-full border border-white/20 ${
            isOpening ? "animate-[trailer-wave-wide_1.85s_ease-out_forwards]" : ""
          }`}
        />
        <Play className="relative h-9 w-9 fill-white/90 text-white drop-shadow-[0_4px_14px_rgba(0,0,0,.45)]" />
      </button>

      <style jsx>{`
        @keyframes trailer-idle-wave {
          0% {
            opacity: 0;
            transform: scale(0.72);
          }
          35% {
            opacity: 0.42;
          }
          100% {
            opacity: 0;
            transform: scale(1.22);
          }
        }

        @keyframes trailer-wave {
          0% {
            opacity: 0.55;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(4.2);
          }
        }

        @keyframes trailer-wave-wide {
          0% {
            opacity: 0.38;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(5.4);
          }
        }
      `}</style>

      {isOpen ? (
        <div ref={fullscreenRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black" dir="rtl">
          <button
            aria-label="بستن تریلر"
            className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
            onClick={closeTrailer}
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
          <video
            autoPlay
            className="h-full w-full object-contain"
            controls
            playsInline
            src={trailerUrl}
            title={title}
          />
        </div>
      ) : null}
    </>
  );
}
