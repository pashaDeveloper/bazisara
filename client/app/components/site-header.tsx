"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Grid2x2,
  Phone,
  Search,
  ShoppingBag,
  ShoppingBasket,
  UserRound,
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
  { href: "/magazines", label: "مجله بازی بازار", icon: Grid2x2 },
  { href: "/products2", label: "پیگیری سفارشات", icon: ChevronDown },
  { href: "/contact", label: "تماس با ما", icon: Phone },
  { href: "/about", label: "ارتباط با ما", icon: ChevronDown },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const hideMobileHeader = Boolean(pathname?.startsWith("/games/") && pathname.split("/").length >= 4);

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
      {!hideMobileHeader ? (
      <div className="mx-auto max-w-[1440px] px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="منو"
            onClick={() => setMenuOpen((current) => !current)}
            className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9deea] bg-white text-zinc-700 shadow-[0_8px_18px_-16px_rgba(0,0,0,.35)]"
          >
            <span className="relative h-4 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out ${
                  menuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 ease-out ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-out ${
                  menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
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
      ) : null}

      {!hideMobileHeader ? (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ease-out lg:hidden ${
            menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!menuOpen}
        >
          <button
            type="button"
            aria-label="بستن منو"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
          />
          <aside
            className={`absolute inset-y-0 left-0 flex w-[86vw] max-w-[360px] flex-col overflow-hidden bg-white shadow-[0_24px_64px_-28px_rgba(0,0,0,.45)] transition-transform duration-300 ease-out ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-start border-b border-[#eef1f5] px-4 py-4 pl-16">
              <Link href="/" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1}>
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
                      tabIndex={menuOpen ? 0 : -1}
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
