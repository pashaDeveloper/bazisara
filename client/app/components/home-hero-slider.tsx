"use client";

import { useEffect, useRef, useState } from "react";
import type { Slider } from "../lib/api";
import { mediaUrl } from "../lib/api";

function SliderSkeleton() {
  return (
    <section className="w-full overflow-hidden bg-white">
      <div className="px-4 py-3 lg:hidden">
        <div className="h-36 animate-pulse rounded-2xl bg-[linear-gradient(90deg,#e8edf5_0%,#f5f7fb_45%,#e4e9f1_100%)]" />
      </div>
      <div className="hidden md:block">
        <div className="relative h-[270px] w-full md:h-[397px]">
          <div className="absolute inset-0 animate-pulse bg-[linear-gradient(90deg,#f3f5f8_0%,#fafbfc_45%,#edf1f6_100%)]" />
        </div>
      </div>
    </section>
  );
}

export function HomeHeroSlider({ sliders }: { sliders: Slider[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedSlideIds, setFailedSlideIds] = useState<string[]>([]);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const visibleSliders = sliders
    .filter((slider) => slider.status !== "inactive")
    .map((slider) => ({ ...slider, imageUrl: mediaUrl(slider.image) }))
    .filter((slider) => slider.imageUrl && !failedSlideIds.includes(slider._id));

  const loopedMobileSlides = [...visibleSliders, ...visibleSliders, ...visibleSliders];

  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!visibleSliders.length) return;
    const firstMiddleSlide = track?.children.item(visibleSliders.length) as HTMLElement | null;
    firstMiddleSlide?.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
  }, [visibleSliders.length]);

  if (!visibleSliders.length) return <SliderSkeleton />;

  const normalizedActiveIndex = activeIndex % visibleSliders.length;
  const activeSlide = visibleSliders[normalizedActiveIndex];

  const scrollToSlide = (index: number) => {
    setActiveIndex(index);
    const track = mobileTrackRef.current;
    const slide = track?.children.item(visibleSliders.length + index) as HTMLElement | null;
    slide?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section className="w-full overflow-hidden bg-white">
      <div className="relative px-0 py-0 lg:hidden">
        <div
          ref={mobileTrackRef}
          className="flex gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          dir="ltr"
        >
          {loopedMobileSlides.map((slide, index) => (
            <button
              key={`${slide._id}-${index}`}
              type="button"
              onClick={() => scrollToSlide(index % visibleSliders.length)}
              className="relative h-[170px] w-[84vw] shrink-0 overflow-hidden rounded-[1.25rem] bg-white shadow-[0_16px_30px_-26px_rgba(0,0,0,.35)] sm:h-[188px] sm:w-[66vw]"
            >
              <img
                src={slide.imageUrl}
                alt={slide.title || ""}
                className="h-full w-full object-cover object-center"
                onError={() =>
                  setFailedSlideIds((current) =>
                    current.includes(slide._id) ? current : [...current, slide._id],
                  )
                }
              />
            </button>
          ))}
        </div>

        <div className="absolute bottom-5 left-7 flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-2 backdrop-blur-sm">
          {visibleSliders.map((slide, index) => (
            <button
              key={slide._id}
              type="button"
              aria-label={`نمایش اسلاید ${index + 1}`}
              onClick={() => scrollToSlide(index)}
              className={`rounded-full transition-all ${
                index === normalizedActiveIndex ? "h-2.5 w-6 bg-white" : "h-2.5 w-2.5 bg-white/65"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="relative h-[397px] w-full">
          <img
            src={activeSlide.imageUrl}
            alt={activeSlide.title || ""}
            className="h-full w-full object-cover object-center"
            onError={() =>
              setFailedSlideIds((current) =>
                current.includes(activeSlide._id) ? current : [...current, activeSlide._id],
              )
            }
          />

          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-2 md:bottom-6 md:left-12">
            {visibleSliders.map((slide, index) => (
              <button
                key={slide._id}
                type="button"
                aria-label={`نمایش اسلاید ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`rounded-full transition-all ${
                  index === normalizedActiveIndex ? "h-2.5 w-6 bg-white" : "h-2.5 w-2.5 bg-white/65 hover:bg-white/85"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
