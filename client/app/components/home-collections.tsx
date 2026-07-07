"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article, Game } from "../lib/api";
import { mediaUrl } from "../lib/api";
import { slugify } from "../lib/slug";
import { DashboardCardSkeleton } from "./cards";

type CategoryChip = {
  id: string;
  name: string;
};

function uniqueCategories(items: Array<Article | Game>) {
  const seen = new Map<string, CategoryChip>();

  items.forEach((item) => {
    const category = item.category;
    if (!category?._id || !category.name) return;
    if (!seen.has(category._id)) {
      seen.set(category._id, { id: category._id, name: category.name });
    }

    if (!("genres" in item) || !item.showGenresInCategories) return;
    item.genres?.forEach((genre) => {
      if (!genre._id || !genre.name) return;
      const id = `genre:${genre._id}`;
      if (!seen.has(id)) seen.set(id, { id, name: genre.name });
    });
  });

  return Array.from(seen.values());
}

function itemMatchesCategory(item: Article | Game, selectedCategory: string) {
  if (selectedCategory === "all") return true;
  if (item.category?._id === selectedCategory) return true;
  if (!("genres" in item) || !item.showGenresInCategories || !selectedCategory.startsWith("genre:")) return false;

  const genreId = selectedCategory.replace(/^genre:/, "");
  return Boolean(item.genres?.some((genre) => genre._id === genreId));
}

function ChipButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
      }`}
    >
      {children}
    </button>
  );
}

function ContentCard({
  href,
  title,
  image,
  align = "right",
}: {
  href: string;
  title: string;
  image?: string;
  align?: "left" | "right";
}) {
  return (
    <Link
      href={href}
      className="group block w-full space-y-2 transition hover:-translate-y-1"
      dir={align === "left" ? "ltr" : "rtl"}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl">
        {image ? (
          <img alt={title} className="h-full w-full object-cover" src={image} />
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-zinc-800/20" />
        )}
      </div>
      <h3 className={`line-clamp-2 text-md font-bold leading-5 text-zinc-950 ${align === "left" ? "text-left" : "text-right"}`}>
        {title}
      </h3>
    </Link>
  );
}

function SectionHeader({
  href,
  label,
  title,
}: {
  href: string;
  label: string;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between" dir="rtl">
      <h2 className="text-right text-xl font-black text-[#25335f]">{title}</h2>
      <Link
        href={href}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950"
      >
        {label}
      </Link>
    </div>
  );
}

function FilteredSection<T extends Article | Game>({
  href,
  items,
  title,
  label,
  getImage,
  align = "right",
}: {
  href: string;
  items: T[];
  title: string;
  label: string;
  getImage: (item: T) => string;
  align?: "left" | "right";
}) {
  const categories = useMemo(() => uniqueCategories(items), [items]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems = useMemo(
    () =>
      items.filter((item) => itemMatchesCategory(item, selectedCategory)),
    [items, selectedCategory],
  );

  return (
    <section className="mx-6 mt-10">
      <SectionHeader href={href} label={label} title={title} />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2" dir="rtl">
        <ChipButton active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")}>
          همه
        </ChipButton>
        {categories.map((category) => (
          <ChipButton
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </ChipButton>
        ))}
      </div>

      {filteredItems.length ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filteredItems.slice(0, 4).map((item) => (
            <ContentCard
              key={item._id}
              align={align}
              href={`${href.replace(/\/$/, "")}/${slugify(item.slug || item.title) || item._id}/${item._id}`}
              image={getImage(item)}
              title={item.title}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <DashboardCardSkeleton key={index} />
          ))}
        </div>
      )}
    </section>
  );
}

const articleTopicChips = ["تازه‌ها", "داغ 🔥", "ایران", "علمی 🚀", "مطالب شاخص"];

const articlePlatformTabs = [
  { title: "PS5", image: "/products/png/ps5-slim-disc.png" },
  { title: "PS4", image: "/products/png/ps4-slim.png" },
  { title: "PS3", image: "/products/png/ps5-pro.png" },
  { title: "Switch", image: "/products/png/nintendo-switch-oled.png" },
  { title: "Xbox One", image: "/products/png/xbox-series-s.png" },
];

function articleHref(article: Article) {
  return `/articles/${slugify(article.slug || article.title) || article._id}/${article._id}`;
}

function formatArticleTime(article: Article) {
  return article.readingTime || "۳۰ دقیقه قبل";
}

function ArticleListCard({ article }: { article: Article }) {
  const image = mediaUrl(article.cardCover) || mediaUrl(article.cover);

  return (
    <Link
      href={articleHref(article)}
      className="grid min-h-[154px] grid-cols-[150px_minmax(0,1fr)] items-center gap-5 rounded-[2rem] border border-[#e2e7f0] bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#cfd7e5] hover:shadow-[0_18px_36px_-32px_rgba(15,23,42,.35)]"
      dir="rtl"
    >
      <div className="relative h-[124px] w-[124px] overflow-hidden rounded-[1.7rem] border border-[#e1e7f1] bg-white">
        {image ? (
          <img alt={article.title} className="h-full w-full object-cover" src={image} />
        ) : (
          <div className="h-full w-full animate-pulse rounded-[1.7rem] bg-zinc-100" />
        )}
      </div>
      <div className="min-w-0 text-right">
        <h3 className="line-clamp-2 text-[1.35rem] font-black leading-8 text-[#303542]">
          {article.title}
        </h3>
        <div className="mt-5 flex items-center justify-end gap-3 text-sm font-bold text-[#8a91a0]">
          <span>{formatArticleTime(article)}</span>
          <span className="h-5 w-px bg-[#c6ccd7]" />
          <span>{article.views ? article.views.toLocaleString("fa-IR") : "۰"} دیدگاه</span>
        </div>
      </div>
    </Link>
  );
}

function ArticleSkeletonRow() {
  return (
    <div className="grid min-h-[154px] grid-cols-[150px_minmax(0,1fr)] items-center gap-5 rounded-[2rem] border border-[#e2e7f0] bg-white px-4 py-3">
      <div className="h-[124px] w-[124px] animate-pulse rounded-[1.7rem] border border-[#e1e7f1] bg-zinc-100" />
      <div className="space-y-4">
        <div className="h-6 w-full animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-6 w-3/4 animate-pulse rounded-lg bg-zinc-100" />
        <div className="mr-auto h-4 w-1/2 animate-pulse rounded-lg bg-zinc-100" />
      </div>
    </div>
  );
}

function HomeArticlesSection({ articles }: { articles: Article[] }) {
  const categories = useMemo(() => uniqueCategories(articles).slice(0, 4), [articles]);
  const [activeChip, setActiveChip] = useState("تازه‌ها");
  const [activePlatform, setActivePlatform] = useState("PS5");
  const visibleArticles = articles.slice(0, 6);
  const rightColumn = visibleArticles.slice(0, 3);
  const leftColumn = visibleArticles.slice(3, 6);

  const renderRows = (items: Article[], offset = 0) => {
    if (!items.length) {
      return Array.from({ length: 3 }, (_, index) => (
        <ArticleSkeletonRow key={`skeleton-${offset + index}`} />
      ));
    }

    return items.map((article) => (
      <ArticleListCard article={article} key={article._id} />
    ));
  };

  return (
    <section className="mx-4 mt-10 rounded-[1.6rem] border border-[#e5e9f1] bg-[#fbfbfd] px-9 py-8 shadow-[0_18px_48px_-42px_rgba(15,23,42,.25)]" dir="rtl">
      <h2 className="mb-4 text-right text-2xl font-black text-[#25335f]">از ما بخوانید</h2>

      <div className="mb-4 rounded-2xl border border-[#e7ebf2] bg-white px-4 py-2">
        <div className="flex flex-row flex-wrap items-center justify-start gap-3" dir="rtl">
          {[...articleTopicChips, ...categories.map((category) => category.name)].slice(0, 7).map((chip) => {
            const active = activeChip === chip;

            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveChip(chip)}
                className={`rounded-full border px-5 py-2 text-sm font-black transition-all duration-200 ease-out ${
                  active
                    ? "border-[#2f3340] bg-[#2f3340] text-white"
                    : "border-[#edf0f5] bg-white text-[#4d5361] hover:border-[#d6dce7] hover:text-[#222734]"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-5 gap-3">
        {articlePlatformTabs.map((platform) => {
          const active = activePlatform === platform.title;

          return (
            <button
              key={platform.title}
              type="button"
              onClick={() => setActivePlatform(platform.title)}
              className={`flex h-[76px] items-center justify-center gap-3 rounded-xl border transition-all duration-200 ease-out ${
                active
                  ? "border-[#303030] bg-[#333] text-white"
                  : "border-[#edf0f5] bg-white text-[#111] hover:border-[#d7dde8]"
              }`}
            >
              <span className="relative h-12 w-16">
                <Image
                  alt={platform.title}
                  fill
                  sizes="5rem"
                  src={platform.image}
                  className="object-contain"
                />
              </span>
              <span className="text-lg font-black">{platform.title}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-7 lg:grid-cols-[1fr_1px_1fr]" dir="rtl">
        <div className="space-y-5">{renderRows(rightColumn)}</div>
        <div className="hidden bg-[#e2e7f0] lg:block" />
        <div className="space-y-5">{renderRows(leftColumn, 3)}</div>
      </div>

      <div className="mt-8 flex justify-start gap-2" dir="rtl">
        {["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸"].map((page, index) => (
          <button
            key={page}
            type="button"
            className={`h-11 w-11 rounded-lg border text-sm font-black transition ${
              index === 0
                ? "border-[#f43f5e] bg-[#f43f5e] text-white"
                : "border-[#e1e6ef] bg-white text-[#586071] hover:border-[#cbd3df]"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </section>
  );
}

export function HomeCollections({
  articles,
  games,
}: {
  articles: Article[];
  games: Game[];
}) {
  return (
    <>
      <FilteredSection
        href="/games"
        items={games}
        label="همه بازی‌ها"
        title="لیست بازی‌ها"
        align="left"
        getImage={(game) =>
          mediaUrl(game.cardDesktopCover) ||
          mediaUrl(game.cover) ||
          mediaUrl(game.desktopCover) ||
          mediaUrl(game.gallery?.[0])
        }
      />

      <HomeArticlesSection articles={articles} />
    </>
  );
}
