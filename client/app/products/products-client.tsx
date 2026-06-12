"use client";

import {
  ChevronDown,
  Filter,
  Grid2x2,
  House,
  ListFilter,
  Phone,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import {
  desktopPlatforms,
  desktopProducts,
  genreChips,
  mobileProducts,
  sidebarSections,
  type Genre,
  type Maker,
  type Platform,
  type SortOption,
} from "./data";
import {
  BrandWordmark,
  EmptyState,
  FilterChip,
  MobilePosterCard,
  PlatformPill,
  ProductCard,
  SkeletonCard,
} from "./ui";

export default function ProductsClient() {
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("ps5");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("ماجراجویی");
  const [sortOption, setSortOption] = useState<SortOption>("پرفروش‌ترین");
  const [maker, setMaker] = useState<Maker>("همه");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [openedSections, setOpenedSections] = useState<Record<string, boolean>>({
    "دسته بندی": true,
    "شرکت سازنده": false,
    "محدوده قیمت مورد نظر": false,
    "نوع دستگاه": false,
    "تعداد درگاه": false,
    "وزن": false,
  });
  const [loadingGrid, setLoadingGrid] = useState(true);
  const [loadingTick, setLoadingTick] = useState(0);

  const deferredSearch = useDeferredValue(search.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingGrid(false), 650);
    return () => window.clearTimeout(timer);
  }, [loadingTick]);

  const restartLoading = () => {
    setLoadingGrid(true);
    setLoadingTick((value) => value + 1);
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    restartLoading();
  };

  const updatePlatform = (value: Platform) => {
    setSelectedPlatform(value);
    restartLoading();
  };

  const updateGenre = (value: Genre) => {
    setSelectedGenre(value);
    restartLoading();
  };

  const cycleSort = () => {
    setSortOption((current) =>
      current === "پرفروش‌ترین"
        ? "ارزان‌ترین"
        : current === "ارزان‌ترین"
          ? "گران‌ترین"
          : "پرفروش‌ترین",
    );
    restartLoading();
  };

  const updateMaker = (value: Maker) => {
    setMaker(value);
    restartLoading();
  };

  const toggleStock = () => {
    setInStockOnly((value) => !value);
    restartLoading();
  };

  const resetFilters = () => {
    setSelectedGenre("همه");
    setMaker("همه");
    setInStockOnly(false);
    setSortOption("پرفروش‌ترین");
    restartLoading();
  };

  const desktopFiltered = desktopProducts
    .filter((product) => product.platform === selectedPlatform)
    .filter((product) => (selectedGenre === "همه" ? true : product.genre === selectedGenre))
    .filter((product) => (maker === "همه" ? true : product.maker === maker))
    .filter((product) => (inStockOnly ? product.available : true))
    .filter((product) =>
      deferredSearch
        ? `${product.title} ${product.subtitle}`
            .toLocaleLowerCase("fa-IR")
            .includes(deferredSearch.toLocaleLowerCase("fa-IR"))
        : true,
    )
    .sort((a, b) => {
      if (sortOption === "ارزان‌ترین") return a.price - b.price;
      if (sortOption === "گران‌ترین") return b.price - a.price;
      return Number(b.available) - Number(a.available);
    });

  const mobileFiltered = mobileProducts
    .filter((product) => product.platform === selectedPlatform)
    .filter((product) => (selectedGenre === "همه" ? true : product.genre === selectedGenre))
    .filter((product) =>
      deferredSearch
        ? product.title.toLowerCase().includes(deferredSearch.toLowerCase())
        : true,
    );

  return (
    <div className="min-h-screen bg-[#fbfcfe] text-zinc-900">
      <div className="mx-auto hidden max-w-[1440px] px-5 pb-16 pt-5 lg:block">
        <div className="rounded-[2rem] border border-[#e7ebf0] bg-white/90 p-4 shadow-[0_26px_70px_-45px_rgba(45,35,20,.22)] backdrop-blur">
          <div className="flex items-center gap-4">
            <BrandWordmark />
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="جستجو..."
                className="h-14 w-full rounded-2xl border border-[#e6eaf0] bg-[#f7f9fc] pr-12 pl-4 text-sm outline-none transition focus:border-[#cdd6e3] focus:bg-white"
              />
            </div>
            <button
              type="button"
              className="flex h-14 items-center gap-2 rounded-2xl border border-[#e6eaf0] bg-[#f8fafc] px-4 text-sm font-medium text-zinc-700"
            >
              <Search className="h-4 w-4" />
              مقایسه‌ کالاها
            </button>
            <button
              type="button"
              className="flex h-14 items-center gap-2 rounded-2xl border border-[#e6eaf0] bg-[#f8fafc] px-4 text-sm font-medium text-zinc-700"
            >
              <Trash2 className="h-4 w-4" />
              محصولات هدررفته
            </button>
            <div className="flex h-14 min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-[#f7fbff] px-4 text-sm font-bold text-[#159a5e] ring-1 ring-[#dce7f3]">
              <Phone className="h-4 w-4" />
              ۰۲۱ - ۶۶۰۰ ۶۶۶۳
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#eef2f6] pt-4 text-sm text-zinc-600">
            <div className="flex items-center gap-6">
              <a href="#" className="transition hover:text-zinc-900">
                فروشگاه بازی‌ها
              </a>
              <a href="#" className="transition hover:text-zinc-900">
                Open Box
              </a>
              <a href="#" className="transition hover:text-zinc-900">
                مجله آی‌گیم
              </a>
              <a href="#" className="transition hover:text-zinc-900">
                پیگیری سفارشات
              </a>
              <a href="#" className="transition hover:text-zinc-900">
                تماس با ما
              </a>
            </div>
            <div className="flex items-center gap-2 font-medium text-zinc-500">
              <Grid2x2 className="h-4 w-4" />
              دسته‌بندی کالاها
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-[300px_minmax(0,1fr)] gap-5">
          <aside className="sticky top-3 self-start rounded-[2rem] border border-[#e7ebf0] bg-white p-5">
            <div className="flex items-center justify-between border-b border-[#eef2f6] pb-4">
              <div className="flex items-center gap-2 text-base font-black">
                <Filter className="h-5 w-5 text-zinc-500" />
                فیلترها
              </div>
              <button
                type="button"
                className="text-sm font-medium text-zinc-400 transition hover:text-zinc-800"
                onClick={resetFilters}
              >
                حذف فیلترها
              </button>
            </div>

            <div className="flex items-center justify-between py-5 text-sm font-medium">
              <span>فقط محصولات موجود</span>
              <button
                type="button"
                onClick={toggleStock}
                className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                  inStockOnly ? "bg-[#1c9f64]" : "bg-[#e5e7eb]"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white transition ${
                    inStockOnly ? "-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-1 border-t border-[#eef2f6] pt-2">
              {sidebarSections.map((section) => {
                const isOpen = openedSections[section];

                return (
                  <div key={section} className="border-b border-[#f1f4f8] py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenedSections((current) => ({
                          ...current,
                          [section]: !current[section],
                        }))
                      }
                      className="flex w-full items-center justify-between py-3 text-right text-sm font-medium"
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-zinc-400 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                      <span>{section}</span>
                    </button>

                    {isOpen ? (
                      <div className="pb-3">
                        {section === "دسته بندی" ? (
                          <div className="flex flex-wrap gap-2">
                            {(["همه", "ماجراجویی", "ریسنگ", "اکشن"] as Genre[]).map(
                              (item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => updateGenre(item)}
                                  className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                                    selectedGenre === item
                                      ? "bg-zinc-900 text-white"
                                      : "bg-[#f4f6f9] text-zinc-600"
                                  }`}
                                >
                                  {item}
                                </button>
                              ),
                            )}
                          </div>
                        ) : null}

                        {section === "شرکت سازنده" ? (
                          <div className="space-y-2 text-sm">
                            {(["همه", "Sony", "Nintendo", "Xbox"] as Maker[]).map(
                              (item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => updateMaker(item)}
                                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 transition ${
                                    maker === item
                                      ? "bg-[#f2f7ff] text-[#276ab2]"
                                      : "bg-[#f7f9fc] text-zinc-600"
                                  }`}
                                >
                                  <span>{item}</span>
                                  <span
                                    className={`h-3 w-3 rounded-full ${
                                      maker === item ? "bg-[#2f92d5]" : "bg-[#d7dee7]"
                                    }`}
                                  />
                                </button>
                              ),
                            )}
                          </div>
                        ) : null}

                        {section === "محدوده قیمت مورد نظر" ? (
                          <div className="space-y-3 text-xs text-zinc-500">
                            <div className="h-2 rounded-full bg-[#edf1f5]">
                              <div className="h-2 w-2/3 rounded-full bg-[#f35c52]" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>از ۱۵ میلیون</span>
                              <span>تا ۶۵ میلیون</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {desktopPlatforms.map((platform) => (
                <div key={platform.value} className="min-w-[170px] flex-1">
                  <PlatformPill
                    label={platform.label}
                    glyph={platform.glyph}
                    icon={platform.icon}
                    selected={selectedPlatform === platform.value}
                    onClick={() => updatePlatform(platform.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-[1.6rem] border border-[#e7ebf0] bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={cycleSort}
                  className="flex items-center gap-2 rounded-full border border-[#e6eaf0] bg-[#f8fafc] px-4 py-2 text-sm font-medium text-zinc-700"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {sortOption}
                </button>
                {genreChips.map((chip) => (
                  <FilterChip
                    key={chip.value}
                    label={chip.label}
                    icon={chip.icon}
                    active={selectedGenre === chip.value}
                    onClick={() => updateGenre(chip.value)}
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-zinc-500">
                {desktopFiltered.length.toLocaleString("fa-IR")} کالا
              </div>
            </div>

            <section className="space-y-5">
              {loadingGrid ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 8 }, (_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : desktopFiltered.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {desktopFiltered.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => (
                      <SkeletonCard key={`tail-${index}`} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState />
              )}
            </section>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="sticky top-0 z-20 border-b border-[#f1e9dd] bg-white/90 px-4 pb-4 pt-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <BrandWordmark compact />
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="جستجو..."
              className="h-14 w-full rounded-[1.35rem] border border-[#e6eaf0] bg-[#f7f9fc] pr-12 pl-4 text-base outline-none transition focus:border-[#cdd6e3] focus:bg-white"
            />
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            <button
              type="button"
              className="flex min-w-[82px] shrink-0 flex-col items-center justify-center rounded-[1.35rem] border border-[#e6eaf0] bg-white px-3 py-3 text-sm font-bold text-zinc-600"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4f6f9] text-zinc-500">
                <ListFilter className="h-5 w-5" />
              </div>
              فیلتر
            </button>

            {desktopPlatforms.map((platform) => (
              <button
                key={platform.value}
                type="button"
                onClick={() => updatePlatform(platform.value)}
                className={`min-w-[92px] shrink-0 rounded-[1.35rem] border px-3 py-3 text-center transition ${
                  selectedPlatform === platform.value
                    ? "border-[#f0504f] bg-[#f0504f] text-white shadow-[0_18px_28px_-22px_rgba(240,80,79,.85)]"
                    : "border-[#e6eaf0] bg-white text-zinc-700"
                }`}
              >
                <div className="text-xl font-black">{platform.glyph}</div>
                <div
                  className={`mt-1 text-xs ${
                    selectedPlatform === platform.value
                      ? "text-white/80"
                      : "text-zinc-400"
                  }`}
                >
                  {platform.label}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {genreChips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => updateGenre(chip.value)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold ${
                  selectedGenre === chip.value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-[#e6eaf0] bg-[#f8fafc] text-zinc-700"
                }`}
              >
                <chip.icon className="h-4 w-4" />
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <main className="px-4 pb-28 pt-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {(loadingGrid ? [] : mobileFiltered).map((product) => (
              <MobilePosterCard key={product.id} product={product} />
            ))}

            {loadingGrid
              ? Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="aspect-[0.84] animate-pulse rounded-[1.4rem] bg-[linear-gradient(180deg,#eef2f7_0%,#f8fafc_100%)]" />
                    <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#e8edf3]" />
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#e8edf3]" />
                  </div>
                ))
              : null}
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e6eaf0] bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
            {[
              { label: "صفحه خانه", icon: House },
              { label: "دسته‌بندی‌ها", icon: Grid2x2 },
              { label: "سبد خرید", icon: ShoppingBasket },
              { label: "ناحیه کاربری", icon: UserRound },
            ].map((item, index) => (
              <button
                key={item.label}
                type="button"
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium ${
                  index === 1 ? "text-[#f05e52]" : "text-zinc-500"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
