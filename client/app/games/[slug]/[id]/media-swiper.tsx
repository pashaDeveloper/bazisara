"use client";

import { Play } from "lucide-react";
import { useState } from "react";
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

  if (!slides.length) return null;

  return (
    <section className="bg-white px-4 py-8 lg:mx-auto lg:mt-8 lg:max-w-[1440px] lg:px-0" dir="ltr" aria-label={`${title} media`}>
      <div className="flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:gap-4 lg:gap-5 [&::-webkit-scrollbar]:hidden">
        {slides.map((slide, index) => (
          <button
            key={`${slide.kind}-${slide.imageSrc}-${index}`}
            type="button"
            aria-label={slide.kind === "trailer" ? "نمایش تریلر" : `نمایش تصویر ${index + 1}`}
            onClick={() => setActiveIndex(index)}
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
    </section>
  );
}
