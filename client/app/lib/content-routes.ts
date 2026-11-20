import type { Article, Game, NamedEntity } from "./api";
import { articleRouteId, gameRouteId } from "./api";
import { slugify } from "./slug";

const publicRouteId = /^(bazi|mag)-?([a-z0-9]{5})$/i;

function formatRouteId(id: string) {
  return id.replace(publicRouteId, "$1-$2");
}

export function storedRouteId(id: string) {
  return id.replace(/^(bazi|mag)-([a-z0-9]{5})$/i, "$1$2");
}

export function gameHref(game: Pick<Game, "_id" | "gameId" | "playstationTitleId" | "slug" | "title">) {
  const id = formatRouteId(gameRouteId(game));
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
  if (["magzine", "magazine", "magazines", "مجله"].includes(path[0])) path.shift();
  return path;
}

export function articleHref(article: Pick<Article, "_id" | "magazineId" | "slug" | "title" | "category">) {
  const id = formatRouteId(articleRouteId(article));
  return `/magzine/${[...articleCategorySegments(article.category), id, slugify(article.slug || article.title) || id].join("/")}`;
}
