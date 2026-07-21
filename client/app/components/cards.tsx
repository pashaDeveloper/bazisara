import Link from "next/link";
import type { Article, Game } from "../lib/api";
import { articleRouteId, gameRouteId, mediaUrl } from "../lib/api";
import { slugify } from "../lib/slug";

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-zinc-800/20 ${className}`} />
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="w-full space-y-2" dir="rtl">
      <SkeletonBlock className="aspect-square w-full rounded-xl" />
      <SkeletonBlock className="h-4 w-2/3" />
    </div>
  );
}

export function GameCard({ game }: { game: Game }) {
  const routeId = gameRouteId(game);
  const image =
    mediaUrl(game.cardDesktopCover) ||
    mediaUrl(game.cover) ||
    mediaUrl(game.desktopCover) ||
    mediaUrl(game.gallery?.[0]);

  return (
    <Link
      href={`/games/${slugify(game.slug || game.title) || routeId}/${routeId}`}
      className="group block w-full space-y-2 transition hover:-translate-y-1"
      dir="ltr"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-900">
        {image ? (
          <img alt={game.title} className="h-full w-full object-cover" src={image} />
        ) : (
          <SkeletonBlock className="h-full w-full rounded-xl" />
        )}
      </div>
      {game.title ? (
        <h2 className="line-clamp-2 text-left text-md font-bold leading-5 text-zinc-950">
          {game.title}
        </h2>
      ) : (
        <SkeletonBlock className="h-4 w-2/3" />
      )}
    </Link>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  const routeId = articleRouteId(article);
  const image = mediaUrl(article.cardCover) || mediaUrl(article.cover);

  return (
    <Link
      href={`/magazines/${slugify(article.slug || article.title) || routeId}/${routeId}`}
      className="group grid min-h-[116px] w-full grid-cols-[96px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_16px_32px_-28px_rgba(15,23,42,.45)]"
      dir="rtl"
    >
      <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-900 sm:h-24 sm:w-24">
        {image ? (
          <img alt={article.title} className="h-full w-full object-cover" src={image} />
        ) : (
          <SkeletonBlock className="h-full w-full rounded-xl" />
        )}
      </div>
      <div className="min-w-0 text-right">
        {article.title ? (
          <h2 className="line-clamp-2 text-sm font-bold leading-6 text-zinc-950 sm:text-base">
            {article.title}
          </h2>
        ) : (
          <SkeletonBlock className="h-4 w-2/3" />
        )}
        {article.excerpt ? (
          <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-zinc-500">
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
