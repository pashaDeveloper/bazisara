"use client";

import { Filter, Grid2x2, ListFilter, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ArticleCard, GameCard } from "./cards";
import type { Article, Game, NamedEntity } from "../lib/api";

type CatalogItem = (Article | Game) & {
  category?: NamedEntity | null;
  isFeatured?: boolean;
};

type CatalogKind = "game" | "article";

function uniqueCategories(items: CatalogItem[]) {
  const seen = new Map<string, string>();

  items.forEach((item) => {
    const category = item.category;
    if (!category?._id || !category.name) return;
    if (!seen.has(category._id)) seen.set(category._id, category.name);
  });

  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

function cardSearchText(item: CatalogItem, kind: CatalogKind) {
  if (kind === "article") {
    const article = item as Article;
    return [article.title, article.excerpt, article.author, article.category?.name].filter(Boolean).join(" ");
  }

  const game = item as Game;
  return [game.title, game.shortDescription, game.description, game.category?.name].filter(Boolean).join(" ");
}

function ItemCard({ item, kind }: { item: CatalogItem; kind: CatalogKind }) {
  if (kind === "article") return <ArticleCard article={item as Article} />;
  return <GameCard game={item as Game} />;
}

function SectionHeader({
  title,
  label,
  count,
}: {
  title: string;
  label: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-600">
        {label}
      </div>
      <div className="text-right">
        <h2 className="text-xl font-black text-[#25335f]">{title}</h2>
        <p className="mt-1 text-xs font-bold text-zinc-500">
          {count.toLocaleString("fa-IR")} مورد
        </p>
      </div>
    </div>
  );
}

export function CatalogBrowser({
  items,
  kind,
  title,
  label,
  subtitle,
}: {
  items: CatalogItem[];
  kind: CatalogKind;
  title: string;
  label: string;
  subtitle: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("fa-IR"));
  const categories = useMemo(() => uniqueCategories(items), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = selectedCategory === "all" || item.category?._id === selectedCategory;
      const searchMatch = deferredSearch
        ? cardSearchText(item, kind).toLocaleLowerCase("fa-IR").includes(deferredSearch)
        : true;
      return categoryMatch && searchMatch;
    });
  }, [deferredSearch, items, kind, selectedCategory]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-bold text-sky-600">{label}</p>
        <h1 className="mt-3 text-3xl font-black leading-10 sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600">{subtitle}</p>
      </section>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
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

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden self-start rounded-2xl border border-zinc-200 bg-white p-5 lg:block">
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
                  {items.filter((item) => item.category?._id === category.id).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="relative lg:hidden">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو..."
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pr-12 pl-4 text-sm outline-none transition focus:border-zinc-300 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <div className="text-sm font-bold text-zinc-500">
              {filteredItems.length.toLocaleString("fa-IR")} مورد
            </div>
            <div className="text-sm font-black text-zinc-900">{title}</div>
          </div>

          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  selectedCategory === "all"
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                همه
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    selectedCategory === category.id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

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
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
                موردی پیدا نشد.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
