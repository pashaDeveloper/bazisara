"use client";

import { Play, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BlurImage } from "../../../components/blur-image";

export type GameMediaSlide = {
  alt: string;
  blurSrc: string;
  imageSrc: string;
  kind: "image" | "trailer";
  videoSrc?: string;
};

type GameMediaSwiperProps = {
  slides: GameMediaSlide[];
  title: string;
};

export function GameMediaSwiper({ slides, title }: GameMediaSwiperProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const visibleSlides = useMemo(() => slides.filter((slide) => slide.imageSrc), [slides]);
  const activeSlide = visibleSlides[activeIndex];

  useEffect(() => {
    if (activeIndex >= visibleSlides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, visibleSlides.length]);

  useEffect(() => {
    if (!isTrailerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsTrailerOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isTrailerOpen]);

  if (!visibleSlides.length || !activeSlide) return null;

  const openTrailer = (slide: GameMediaSlide, index: number) => {
    setActiveIndex(index);
    if (slide.kind === "trailer" && slide.videoSrc) {
      setIsTrailerOpen(true);
    }
  };

  return (
    <section className="bg-white px-4 py-4 lg:mx-auto lg:mt-6 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-5">
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="rtl">
        {visibleSlides.map((slide, index) => (
          <button
            aria-label={slide.kind === "trailer" ? `Play ${title} trailer` : `Show media ${index + 1}`}
            className="relative aspect-video w-[72vw] max-w-[320px] shrink-0 overflow-hidden rounded-lg bg-[#101827] shadow-[0_12px_28px_-24px_rgba(15,23,42,.65)] transition hover:opacity-90 sm:w-[280px] lg:w-[300px]"
            key={`${slide.imageSrc}-${index}`}
            onClick={() => openTrailer(slide, index)}
            type="button"
          >
            <BlurImage
              alt={slide.alt}
              blurSrc={slide.blurSrc}
              className="h-full w-full"
              imageClassName="object-cover object-center"
              src={slide.imageSrc}
            />
            {slide.kind === "trailer" ? (
              <span className="absolute inset-0 grid place-items-center bg-black/22 text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/92 text-[#ff3f68] shadow-[0_14px_28px_-18px_rgba(0,0,0,.75)]">
                  <Play className="h-6 w-6 fill-current" />
                </span>
              </span>
            ) : null} b
          </button>
        ))}
      </div>

      {isTrailerOpen && activeSlide.videoSrc ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black" dir="rtl">
          <button
            aria-label="Close trailer"
            className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
            onClick={() => setIsTrailerOpen(false)}
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
          <video autoPlay className="h-full w-full object-contain" controls playsInline src={activeSlide.videoSrc} title={title} />
        </div>
      ) : null}
    </section>
  );
}
