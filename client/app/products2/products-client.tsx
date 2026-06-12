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
  UserRound,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import {
  desktopPlatforms,
  genreChips,
  products,
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
  MobileProductListCard,
  PlatformPill,
  ProductCard,
  SkeletonCard,
} from "./ui";

export default function ProductsClient() {
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("ps5");
  const [selectedGenre, setSelectedGenre] = useState<Genre>("همه");
  const [sortOption, setSortOption] = useState<SortOption>("پرفروش‌ترین");
  const [maker, setMaker] = useState<Maker>("همه");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [openedSections, setOpenedSections] = useState<Record<string, boolean>>({
    "دسته بندی": true,
    "شرکت سازنده": false,
    "محدوده قیمت مورد نظر": true,
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

  const filteredProducts = products
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

  return (
    <div className="min-h-screen bg-[#fbfcfe] text-zinc-900">
      <div className="hidden">
        <div className="mx-auto px-5 py-4">
          <div className="flex flex-row-reverse items-center justify-between gap-6">
            <div className="w-[230px] shrink-0">
              <div className="flex flex-row-reverse items-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4e7ec] bg-white text-zinc-500 transition hover:bg-[#f8fafc]"
                >
                  <ShoppingBasket className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-10 flex-1 items-center justify-between rounded-xl border border-[#e4e7ec] bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-[#f8fafc]"
                >
                  <UserRound className="h-4 w-4 text-zinc-400" />
                  <span>محمدرضا صفری</span>
                </button>
              </div>
            </div>

            <div className="flex-1 px-8">
              <div className="relative mx-auto max-w-[560px]">
                <Search className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="جستجو..."
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
            <div
              className="flex flex-row-reverse items-center gap-2 text-sm font-medium text-[#16a34a]"
              dir="ltr"
              style={{ unicodeBidi: "isolate" }}
            >
              <Phone className="h-4 w-4" />
              <span>۰۲۱ - ۴۲۳ ۰۰۰۰ ۶۳</span>
            </div>

            <div className="flex items-center justify-start gap-4">
              <a
                href="#"
                className="flex flex-row-reverse items-center gap-1 transition hover:text-zinc-900"
              >
                دسته‌بندی کالاها
                <Grid2x2 className="h-4 w-4" />
              </a>
              <span className="h-4 w-px bg-[#e5e7eb]" />
              <a href="#" className="transition hover:text-zinc-900">
                تخفیف‌های ویژه
              </a>
              <span className="h-4 w-px bg-[#e5e7eb]" />
              <a href="#" className="transition hover:text-zinc-900">
                Open Box
              </a>
              <a href="#" className="transition hover:text-zinc-900">
                مجله بازی بازار
              </a>
              <a
                href="#"
                className="flex flex-row-reverse items-center gap-1 transition hover:text-zinc-900"
              >
                <ChevronDown className="h-4 w-4" />
                پیگیری سفارشات
              </a>
              <a
                href="#"
                className="flex flex-row-reverse items-center gap-1 transition hover:text-zinc-900"
              >
                تماس با ما
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden w-full bg-[#fbfcfe] px-4 pb-16 pt-3 lg:block">
        <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-4">
          <aside className="sticky top-3 self-start rounded-[1.4rem] border border-[#e7ebf0] bg-white p-5">
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
                      className="flex flex-row-reverse w-full items-center justify-between py-3 text-right text-sm font-medium"
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
                            {(["همه", "ماجراجویی", "ریسینگ", "اکشن"] as Genre[]).map(
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
                            {(["همه", "Sony", "Nintendo", "Xbox"] as Maker[]).map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => updateMaker(item)}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 transition ${
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
                            ))}
                          </div>
                        ) : null}

                        {section === "محدوده قیمت مورد نظر" ? (
                          <div className="space-y-5 rounded-2xl bg-[#f8fafc] p-4 text-xs text-zinc-500">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="rounded-full bg-white px-3 py-1 text-[#4b557a] shadow-[0_10px_24px_-22px_rgba(24,35,55,.45)]">
                                ۱۵ میلیون
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-[#4b557a] shadow-[0_10px_24px_-22px_rgba(24,35,55,.45)]">
                                ۶۵ میلیون
                              </span>
                            </div>

                            <div className="relative px-1 pt-4">
                              <div className="h-2 rounded-full bg-[#e4e9f0]" />
                              <div className="absolute top-4 right-[18%] h-2 w-[58%] rounded-full bg-[#f35c52]" />
                              <div className="absolute top-[0.55rem] right-[18%] h-5 w-5 rounded-full border-[3px] border-white bg-[#f35c52] shadow-[0_8px_18px_-10px_rgba(243,92,82,.9)]" />
                              <div className="absolute top-[0.55rem] right-[76%] h-5 w-5 rounded-full border-[3px] border-white bg-[#f35c52] shadow-[0_8px_18px_-10px_rgba(243,92,82,.9)]" />
                              <div className="mt-3 flex items-center justify-between px-0.5">
                                {Array.from({ length: 7 }, (_, index) => (
                                  <span
                                    key={index}
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      index >= 1 && index <= 5 ? "bg-[#f35c52]" : "bg-[#cfd7e2]"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-[#818aa0]">
                              <span>۰</span>
                              <span>۳۰</span>
                              <span>۶۰</span>
                              <span>۹۰+</span>
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
            <div className="grid grid-cols-4 gap-3 pb-1 2xl:grid-cols-6" dir="rtl">
              {desktopPlatforms.map((platform) => (
                  <div key={platform.value} className="min-w-0">
                  <PlatformPill
                    label={platform.label}
                    image={platform.image}
                    accent={platform.accent}
                    selected={selectedPlatform === platform.value}
                    onClick={() => updatePlatform(platform.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-[1.2rem] border border-[#e7ebf0] bg-white px-4 py-3">
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
                {filteredProducts.length.toLocaleString("fa-IR")} کالا
              </div>
            </div>

            <section className="space-y-5">
              {loadingGrid ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 8 }, (_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {filteredProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} isPriority={index < 4} />
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

      <div className="bg-white lg:hidden">
        <div className="sticky top-0 z-20 border-b border-[#eef1f5] bg-white/95 pb-3 backdrop-blur">
          <div className="platform-filter-scroll flex gap-2 overflow-x-auto px-2 pt-2 pb-3" dir="rtl">
            <button
              type="button"
              className="flex min-w-[66px] shrink-0 flex-col items-center justify-center rounded-lg border border-[#e6eaf0] bg-white px-2 py-2 text-xs font-black text-zinc-600 shadow-[0_10px_24px_-20px_rgba(24,35,55,.55)]"
            >
              <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f6f9] text-zinc-500">
                <ListFilter className="h-5 w-5" />
              </div>
              فیلتر
            </button>

            {desktopPlatforms.map((platform) => (
              <div
                key={platform.value}
                className="min-w-[66px] shrink-0"
              >
                <PlatformPill
                  label={platform.label}
                  image={platform.image}
                  accent={platform.accent}
                  selected={selectedPlatform === platform.value}
                  onClick={() => updatePlatform(platform.value)}
                  compact
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto bg-[#f4f6f9] px-3 py-3" dir="rtl">
            {genreChips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => updateGenre(chip.value)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                  selectedGenre === chip.value
                    ? "border-[#dfe5ee] bg-white text-[#4b557a]"
                    : "border-[#e6eaf0] bg-[#f8fafc] text-zinc-700"
                }`}
              >
                <chip.icon className="h-4 w-4" />
                {chip.label}
              </button>
            ))}
            <button
              type="button"
              onClick={cycleSort}
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#e6eaf0] bg-white px-3 py-2 text-sm font-bold text-[#4b557a]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {filteredProducts.length.toLocaleString("fa-IR")} کالا
            </button>
          </div>
        </div>

        <main className="pb-24">
          <div className="divide-y divide-[#eef1f5]">
            {(loadingGrid ? [] : filteredProducts).map((product, index) => (
              <MobileProductListCard key={product.id} product={product} isPriority={index === 0} />
            ))}

            {loadingGrid
              ? Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="flex min-h-[190px] flex-row-reverse gap-4 px-5 py-6">
                    <div className="h-36 w-32 shrink-0 animate-pulse rounded-2xl bg-[#eef2f7]" />
                    <div className="flex-1 space-y-3 pt-4">
                      <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#e8edf3]" />
                      <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#e8edf3]" />
                      <div className="mt-7 h-5 w-1/2 animate-pulse rounded-full bg-[#e8edf3]" />
                    </div>
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
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium ${
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
