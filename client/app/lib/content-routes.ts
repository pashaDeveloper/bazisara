import type { Article, Game, NamedEntity } from "./api";
import { articleRouteId, gameRouteId } from "./api";
import { slugify } from "./slug";

export function gameHref(game: Pick<Game, "_id" | "gameId" | "playstationTitleId" | "slug" | "title">) {
  const id = gameRouteId(game);
  return `/games/${id}/${slugify(game.slug || game.title) || id}`;
}

export function articleCategorySegments(category?: NamedEntity | null) {
  const path: string[] = [];
  const seen = new Set<NamedEntity>();
  let current = category;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const slug = slugify(current.slug || current.name?.replace(/\u200c/g, " "));
    if (slug) path.unshift(slug);
    current = current.parent;
  }
  if (["magazine", "magazines", "مجله"].includes(path[0])) path.shift();
  return path;
}

export function articleHref(article: Pick<Article, "_id" | "magazineId" | "slug" | "title" | "category">) {
  const id = articleRouteId(article);
  return `/magazine/${[...articleCategorySegments(article.category), id, slugify(article.slug || article.title) || id].join("/")}`;
}
