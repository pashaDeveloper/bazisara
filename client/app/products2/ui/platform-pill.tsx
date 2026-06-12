"use client";

import Image from "next/image";

export function PlatformPill({
  label,
  image,
  accent,
  selected,
  onClick,
  compact = false,
}: {
  label: string;
  image: string;
  accent: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full min-w-0 flex-col items-center justify-center rounded-lg border transition-all ${
        selected
          ? "text-white shadow-[0_14px_28px_-22px_rgba(0,0,0,.65)]"
          : "border-[#e2e6ed] bg-white text-zinc-900 shadow-[0_10px_24px_-22px_rgba(24,35,55,.55)] hover:border-[#d1d6de] hover:bg-[#f1f3f6]"
      } ${compact ? "h-[62px] min-w-[66px] px-2 py-1.5" : "h-[70px] px-5 py-2"}`}
      style={selected ? { backgroundColor: accent, borderColor: accent } : undefined}
    >
      <div className={`relative ${compact ? "h-9 w-12" : "h-10 w-16"}`}>
        <Image
          src={image}
          alt={label}
          fill
          sizes={compact ? "4rem" : "5rem"}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <span className={`font-black leading-none ${compact ? "mt-1 text-[11px]" : "mt-1.5 text-sm"}`}>{label}</span>
    </button>
  );
}
