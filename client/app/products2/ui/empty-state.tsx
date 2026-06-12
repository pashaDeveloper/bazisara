"use client";

import { Search } from "lucide-react";

export function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#d8e0e8] bg-white p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f7fb] text-zinc-500">
        <Search className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-xl font-black">محصولی پیدا نشد</h2>
      <p className="mt-2 text-sm text-zinc-500">فیلترها را تغییر بده یا عبارت دیگری جستجو کن.</p>
    </div>
  );
}
