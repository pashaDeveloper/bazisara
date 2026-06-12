"use client";

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#e8ecf1] bg-white p-4">
      <div className="aspect-square animate-pulse rounded-xl bg-[#eef2f7]" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#eef2f6]" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#eef2f6]" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-[#eef2f6]" />
      </div>
    </div>
  );
}
