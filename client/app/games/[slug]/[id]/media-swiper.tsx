"use client";

import { Play, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BlurImage } from "../../../components/blur-image";

export type GameMediaSlide = {
  alt: string;
  blurSrc?: string;
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
    <section className="bg-white px-4 py-8 lg:mx-auto lg:mt-8 lg:max-w-[1440px] lg:px-0" dir="ltr" aria-label={`${title} media`}>
      <div className="flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:gap-4 lg:gap-5 [&::-webkit-scrollbar]:hidden">
        {visibleSlides.map((slide, index) => (
          <button
            key={`${slide.kind}-${slide.imageSrc}-${index}`}
            type="button"
            aria-label={slide.kind === "trailer" ? "نمایش تریلر" : `نمایش تصویر ${index + 1}`}
            onClick={() => openTrailer(slide, index)}
            className={`relative aspect-video w-[220px] shrink-0 overflow-hidden rounded-xl bg-[#edf1f6] transition sm:w-[252px] lg:w-[260px] ${
              index === activeIndex ? "border-[3px] border-[#1687ff] p-1" : "border border-transparent"
            }`}
          >
            <span className="relative block h-full w-full overflow-hidden rounded-lg">
              <BlurImage alt={slide.alt} blurSrc={slide.blurSrc} className="h-full w-full" imageClassName="object-cover" src={slide.imageSrc} />
              {slide.kind === "trailer" ? (
                <span className="absolute inset-0 grid place-items-center bg-black/12 text-white">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-black/45 backdrop-blur-sm">
                    <Play className="h-5 w-5 fill-white" />
                  </span>
                </span>
              ) : null}
            </span>
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
