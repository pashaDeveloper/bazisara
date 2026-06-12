"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Grid2x2,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  ShoppingBasket,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";

function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-row-reverse items-center gap-3">
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

const navItems = [
  { href: "/products2", label: "دسته‌بندی کالاها", icon: Grid2x2 },
  { href: "/products2", label: "تخفیف‌های ویژه", icon: ChevronDown },
  { href: "/products2", label: "Open Box", icon: ShoppingBasket },
  { href: "/articles", label: "مجله بازی بازار", icon: Grid2x2 },
  { href: "/products2", label: "پیگیری سفارشات", icon: ChevronDown },
  { href: "/contact", label: "تماس با ما", icon: Phone },
  { href: "/about", label: "ارتباط با ما", icon: ChevronDown },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 right-0 left-0 z-30 bg-white ${
        pathname?.startsWith("/products2") ? "border-b-0" : "border-b border-[#e6e9ee]"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="منو"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9deea] bg-white text-zinc-700 shadow-[0_8px_18px_-16px_rgba(0,0,0,.35)]"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="shrink-0">
            <BrandWordmark compact />
          </Link>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            placeholder="جستجو..."
            className="h-12 w-full rounded-xl border-0 bg-[#f2f4f8] pr-11 pl-4 text-sm outline-none ring-1 ring-[#eef1f5] transition focus:ring-[#d7ddea]"
          />
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[86vw] max-w-[360px] flex-col overflow-hidden bg-white shadow-[0_24px_64px_-28px_rgba(0,0,0,.45)]">
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
                <BrandWordmark compact />
              </Link>
            </div>

            <div className="border-b border-[#eef1f5] px-4 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  placeholder="جستجو..."
                  className="h-12 w-full rounded-xl border border-[#edf0f4] bg-[#f6f7fb] pr-11 pl-4 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#e4e7ec] bg-white px-3 py-3 text-sm font-medium text-zinc-700"
                >
                  <ShoppingBasket className="h-4 w-4" />
                  سبد خرید
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#e4e7ec] bg-white px-3 py-3 text-sm font-medium text-zinc-700"
                >
                  <UserRound className="h-4 w-4" />
                  ورود / ثبت‌نام
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-[#eef1f5] bg-[#fafbfd] px-4 py-3 text-sm font-medium text-zinc-700"
                    >
                      <Icon className="h-4 w-4 text-zinc-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#eef1f5] p-4">
              <div
                className="flex items-center justify-between rounded-xl bg-[#f6fafc] px-4 py-3 text-sm font-medium text-[#16a34a]"
                dir="ltr"
              >
                <Phone className="h-4 w-4" />
                <span>021 - 423 0000 63</span>
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
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4e7ec] bg-white text-zinc-500 transition hover:bg-[#f8fafc]"
                  aria-label="سبد خرید"
                >
                  <ShoppingBasket className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-10 flex-1 items-center justify-between rounded-xl border border-[#e4e7ec] bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-[#f8fafc]"
                >
                  <UserRound className="h-4 w-4 text-zinc-400" />
                  <span>ورود / ثبت‌نام</span>
                </button>
              </div>
            </div>

            <div className="flex-1 px-8">
              <div className="relative mx-auto max-w-[560px]">
                <Search className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  placeholder="جستجو..."
                  className="h-10 w-full rounded-xl border border-[#edf0f4] bg-[#f6f7fb] pr-11 pl-4 text-sm outline-none transition focus:border-[#d5dbe5] focus:bg-white"
                />
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              <div className="origin-top-right scale-[0.82]">
                <Link href="/">
                  <BrandWordmark compact />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-row-reverse items-center justify-between gap-6 text-[15px] font-medium text-zinc-600">
            <div className="flex flex-row-reverse items-center gap-2 text-sm font-medium text-[#16a34a]" dir="ltr">
              <Phone className="h-4 w-4" />
              <span>021 - 423 0000 63</span>
            </div>

            <nav className="flex items-center justify-start gap-4">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-row-reverse items-center gap-1 transition hover:text-zinc-900"
                  >
                    {index === 1 || index === 2 ? null : <Icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
