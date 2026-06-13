"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
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
  });

  return Array.from(seen.values());
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
      items.filter((item) =>
        selectedCategory === "all"
          ? true
          : item.category?._id === selectedCategory,
      ),
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

      <FilteredSection
        href="/articles"
        items={articles}
        label="مجلات بیشتر"
        title="مجله فروشگاه"
        getImage={(article) => mediaUrl(article.cover)}
      />
    </>
  );
}
