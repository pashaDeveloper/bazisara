"use client";

import { ShoppingBag } from "lucide-react";

export function BrandWordmark({
  compact = false,
  reverse = false,
}: {
  compact?: boolean;
  reverse?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${reverse ? "flex-row-reverse" : ""}`}>
      <div className="text-right leading-none">
        <div className={`font-black tracking-tight ${compact ? "text-[2rem]" : "text-[2.25rem]"}`}>
          <span className="text-[#f05e52]">بازی </span>
          <span className="text-[#4ab3e7]">بازار</span>
        </div>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4fbff] text-[#2f91d6] ring-1 ring-[#d2edf9]">
        <ShoppingBag className="h-6 w-6" strokeWidth={2.25} />
      </div>
    </div>
  );
}
