"use client";

import { ChevronDown, Grid2x2, Menu, Phone, Search, ShoppingBasket, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandWordmark } from "./brand-wordmark";

export function ProductsTopHeader({
  search = "",
  onSearchChange,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  return <HomeTopHeader search={search} onSearchChange={onSearchChange} />;
}

export function HomeTopHeader({
  search = "",
  onSearchChange,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navItems = [
    { href: "/products2", label: "دسته‌بندی کالاها" },
    { href: "/products2", label: "تخفیف‌های ویژه" },
    { href: "/products2", label: "Open Box" },
    { href: "/articles", label: "مجله بازی بازار" },
    { href: "/products2", label: "پیگیری سفارشات" },
    { href: "/contact", label: "تماس با ما" },
    { href: "/about", label: "ارتباط با ما" },
  ];

  return (
    <div className="sticky inset-x-0 top-0 z-30 border-b border-[#e6e9ee] bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="منو"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9deea] bg-white text-zinc-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="shrink-0">
            <BrandWordmark compact reverse />
          </Link>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="جستجو..."
            readOnly={!onSearchChange}
            className="h-12 w-full rounded-xl border-0 bg-[#f2f4f8] pr-11 pl-4 text-sm outline-none ring-1 ring-[#eef1f5]"
          />
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="بستن منو" className="absolute inset-0 bg-black/35" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-[86vw] max-w-[360px] flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef1f5] px-4 py-4">
              <button
                type="button"
                aria-label="بستن"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4e7ec] bg-white text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <BrandWordmark compact reverse />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-[#e4e7ec] bg-white px-3 py-3 text-sm font-medium text-zinc-700">
                  <ShoppingBasket className="h-4 w-4" />
                  سبد خرید
                </button>
                <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-[#e4e7ec] bg-white px-3 py-3 text-sm font-medium text-zinc-700">
                  <UserRound className="h-4 w-4" />
                  ورود / ثبت‌نام
                </button>
              </div>
              <div className="mt-5 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-[#eef1f5] bg-[#fafbfd] px-4 py-3 text-sm font-medium text-zinc-700"
                  >
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-5 py-4">
          <div className="flex flex-row-reverse items-center justify-between gap-6">
            <div className="w-[230px] shrink-0">
              <div className="flex flex-row-reverse items-center gap-2">
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4e7ec] bg-white text-zinc-500">
                  <ShoppingBasket className="h-4 w-4" />
                </button>
                <button type="button" className="flex h-10 flex-1 items-center justify-between rounded-xl border border-[#e4e7ec] bg-white px-4 text-sm font-medium text-zinc-700">
                  <UserRound className="h-4 w-4 text-zinc-400" />
                  <span>ورود / ثبت‌نام</span>
                </button>
              </div>
            </div>

            <div className="flex-1 px-8">
              <div className="relative mx-auto max-w-[560px]">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  placeholder="جستجو..."
                  readOnly={!onSearchChange}
                  className="h-10 w-full rounded-xl border border-[#edf0f4] bg-[#f6f7fb] pr-11 pl-4 text-sm outline-none transition focus:border-[#d5dbe5] focus:bg-white"
                />
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              <div className="origin-top-right scale-[0.82]">
                <BrandWordmark compact reverse />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-row-reverse items-center justify-between gap-6 text-[15px] font-medium text-zinc-600">
            <div className="flex flex-row-reverse items-center gap-2 text-sm font-medium text-[#16a34a]" dir="ltr">
              <Phone className="h-4 w-4" />
              <span>021 - 423 0000 63</span>
            </div>
            <nav className="flex items-center justify-start gap-4">
              <Link href="/products2" className="flex flex-row-reverse items-center gap-1 transition hover:text-zinc-900">
                دسته‌بندی کالاها
                <Grid2x2 className="h-4 w-4" />
              </Link>
              <span className="h-4 w-px bg-[#e5e7eb]" />
              {navItems.slice(1).map((item) => (
                <Link key={item.label} href={item.href} className="transition hover:text-zinc-900">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
