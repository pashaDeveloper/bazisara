import Link from "next/link";
import type { Article, Game } from "../lib/api";
import { mediaUrl } from "../lib/api";
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
  const image =
    mediaUrl(game.cardDesktopCover) ||
    mediaUrl(game.cover) ||
    mediaUrl(game.desktopCover) ||
    mediaUrl(game.gallery?.[0]);

  return (
    <Link
      href={`/games/${slugify(game.slug || game.title) || game._id}/${game._id}`}
      className="group block w-full space-y-2 transition hover:-translate-y-1"
      dir="ltr"
    >
      <div className="aspect-square overflow-hidden rounded-xl bg-zinc-900">
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
  const image = mediaUrl(article.cover);

  return (
    <Link
      href={`/articles/${slugify(article.slug || article.title) || article._id}/${article._id}`}
      className="group block w-full space-y-2 transition hover:-translate-y-1"
      dir="rtl"
    >
      {article.title ? (
        <h2 className="line-clamp-2 text-right text-md font-bold leading-5 text-zinc-950">
          {article.title}
        </h2>
      ) : (
        <SkeletonBlock className="h-4 w-2/3" />
      )}
      <div className="aspect-square overflow-hidden rounded-xl bg-zinc-900">
        {image ? (
          <img alt={article.title} className="h-full w-full object-cover" src={image} />
        ) : (
          <SkeletonBlock className="h-full w-full rounded-xl" />
        )}
      </div>
    </Link>
  );
}
