"use client";

import { Filter, Grid2x2, ListFilter, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ArticleCard, GameCard } from "./cards";
import { DashboardCardSkeleton } from "./cards";
import type { Article, Game, NamedEntity } from "../lib/api";

type CatalogItem = (Article | Game) & {
  category?: NamedEntity | null;
  isFeatured?: boolean;
};

type CatalogKind = "game" | "article";

function uniqueCategories(items: CatalogItem[], kind: CatalogKind) {
  const seen = new Map<string, string>();

  items.forEach((item) => {
    const category = item.category;
    if (!category?._id || !category.name) return;
    if (!seen.has(category._id)) seen.set(category._id, category.name);

    if (kind !== "game") return;
    const game = item as Game;
    if (!game.showGenresInCategories) return;
    game.genres?.forEach((genre) => {
      if (!genre._id || !genre.name) return;
      const id = `genre:${genre._id}`;
      if (!seen.has(id)) seen.set(id, genre.name);
    });
  });

  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

function itemMatchesCategory(item: CatalogItem, kind: CatalogKind, selectedCategory: string) {
  if (selectedCategory === "all") return true;
  if (item.category?._id === selectedCategory) return true;
  if (kind !== "game" || !selectedCategory.startsWith("genre:")) return false;

  const game = item as Game;
  if (!game.showGenresInCategories) return false;
  const genreId = selectedCategory.replace(/^genre:/, "");
  return Boolean(game.genres?.some((genre) => genre._id === genreId));
}

function cardSearchText(item: CatalogItem, kind: CatalogKind) {
  if (kind === "article") {
    const article = item as Article;
    return [article.title, article.excerpt, article.author, article.category?.name].filter(Boolean).join(" ");
  }

  const game = item as Game;
  return [game.title, game.shortDescription, game.description, game.category?.name].filter(Boolean).join(" ");
}

export function CatalogBrowser({
  items,
  kind,
}: {
  items: CatalogItem[];
  kind: CatalogKind;
  title?: string;
  label?: string;
  subtitle?: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("fa-IR"));
  const categories = useMemo(() => uniqueCategories(items, kind), [items, kind]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = itemMatchesCategory(item, kind, selectedCategory);
      const searchMatch = deferredSearch
        ? cardSearchText(item, kind).toLocaleLowerCase("fa-IR").includes(deferredSearch)
        : true;
      return categoryMatch && searchMatch;
    });
  }, [deferredSearch, items, kind, selectedCategory]);

  return (
    <main className="max-w-none px-2 py-3 sm:px-3 lg:px-4">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-2 lg:hidden">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
            selectedCategory === "all"
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 bg-white text-zinc-600"
          }`}
        >
          <ListFilter className="h-4 w-4" />
          همه
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${
              selectedCategory === category.id
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden self-start rounded-2xl border border-zinc-200 bg-white p-4 lg:block">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-base font-black">
            <Filter className="h-5 w-5 text-zinc-500" />
            فیلترها
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو..."
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pr-12 pl-4 text-sm outline-none transition focus:border-zinc-300 focus:bg-white"
            />
          </div>

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-sm font-medium transition ${
                selectedCategory === "all"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <span>همه دسته‌ها</span>
              <Grid2x2 className="h-4 w-4" />
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-sm font-medium transition ${
                  selectedCategory === category.id
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <span>{category.name}</span>
                <span className="text-xs opacity-80">
                  {items.filter((item) => itemMatchesCategory(item, kind, category.id)).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-3">
          <div className="relative lg:hidden">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو..."
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pr-12 pl-4 text-sm outline-none transition focus:border-zinc-300 focus:bg-white"
            />
          </div>

          <section>
            {filteredItems.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  kind === "article" ? (
                    <ArticleCard key={item._id} article={item as Article} />
                  ) : (
                    <GameCard key={item._id} game={item as Game} />
                  )
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <DashboardCardSkeleton key={index} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
