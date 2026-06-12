"use client";

import type { IconType } from "../data";

export function FilterChip({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: IconType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active ? "border-zinc-900 bg-zinc-900 text-white" : "border-[#e6eaf0] bg-white text-zinc-700 hover:border-[#d5dbe5] hover:bg-[#f8fafc]"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
