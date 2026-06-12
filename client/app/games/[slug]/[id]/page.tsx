import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SkeletonBlock } from "../../../components/cards";
import { ContentEngagement } from "../../../components/content-engagement";
import type { Game } from "../../../lib/api";
import { formatPersianDate, getApiItem, mediaUrl } from "../../../lib/api";

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

function stripHtml(value?: string) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function valueOrSkeleton(value?: string | number | null, width = "w-20") {
  return value ? String(value) : <SkeletonBlock className={`h-4 ${width}`} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const game = await getApiItem<Game>("/games", id);

  return {
    title: game ? `${game.title} | بازی سرا` : "بازی | بازی سرا",
    description: game?.shortDescription,
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params;
  const game = await getApiItem<Game>("/games", id);

  if (!game) notFound();

  const heroImage =
    mediaUrl(game.desktopCover) ||
    mediaUrl(game.cover) ||
    mediaUrl(game.cardDesktopCover) ||
    mediaUrl(game.gallery?.[0]);
  const description = stripHtml(game.description) || game.shortDescription || "";
  const genres = game.genres?.map((item) => item.name).filter(Boolean).join("، ") || "";
  const platforms = game.platforms?.join("، ") || "";
  const specs = [
    ["پلتفرم", platforms],
    ["نسخه", game.edition],
    ["سرویس انتشار", Array.isArray(game.launcher) ? game.launcher.join("، ") : ""],
    ["تاریخ انتشار", formatPersianDate(game.releaseDate)],
    ["رده سنی", game.ageRating],
    ["زمان تقریبی گیم‌پلی", game.gameplayTime],
    ["امتیاز متاکریتیک", game.metacriticScore],
    ["ژانرها", genres],
  ];
  const seoTags = game.tags?.map((tag) => tag.name).filter(Boolean) || [];
  const reviewItems = game.reviewItems || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/games"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-950"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به بازی‌ها
        </Link>

        <section className="overflow-hidden border border-zinc-800 bg-zinc-950" dir="rtl">
          <div className="relative h-64 bg-zinc-900 sm:h-80">
            {heroImage ? (
              <img alt={game.title} className="h-full w-full object-cover" src={heroImage} />
            ) : (
              <SkeletonBlock className="h-full w-full rounded-none" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-white/90 p-4 text-zinc-950 shadow-xl sm:inset-x-auto sm:left-4 sm:w-72">
              {game.title ? (
                <h1 className="line-clamp-2 text-lg font-black">{game.title}</h1>
              ) : (
                <SkeletonBlock className="h-6 w-3/4 bg-zinc-300/25" />
              )}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                {[game.edition, game.ageRating, game.metacriticScore].map((value, index) => (
                  <span className="rounded-lg bg-zinc-100 p-2" key={index}>
                    {value || <SkeletonBlock className="mx-auto h-3 w-10 bg-zinc-300/25" />}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white" type="button">
                  افزودن به سبد
                </button>
                <button className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white" type="button">
                  مشاهده ویدئو
                </button>
              </div>
              <div className="mt-3">
                <ContentEngagement
                  entityType="game"
                  entityId={game._id}
                  views={game.views}
                  likes={game.likes}
                  commentsCount={game.commentsCount}
                  shares={game.shares}
                />
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-800 bg-black px-4 py-3">
            <div className="relative flex gap-6 overflow-x-auto whitespace-nowrap text-xs text-zinc-400">
              {["معرفی", "نقد و بررسی", "مشخصات", "دیدگاه‌ها"].map((tab, index) => (
                <span className={`pb-3 pt-1 ${index === 2 ? "text-white" : ""}`} key={tab}>
                  {tab}
                </span>
              ))}
              <span className="absolute bottom-0 right-[8.4rem] h-0.5 w-12 rounded-full bg-red-500" />
            </div>
          </div>

          <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <div className="space-y-3">
                {game.shortDescription ? (
                  <p className="text-sm leading-7 text-zinc-300">{game.shortDescription}</p>
                ) : null}
                {description ? (
                  <p className="line-clamp-5 text-sm leading-7 text-zinc-300">{description}</p>
                ) : (
                  <SkeletonBlock className="h-4 w-full" />
                )}
                {seoTags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {seoTags.map((tag) => (
                      <span className="rounded-full border border-zinc-800 bg-black px-2.5 py-1 text-[11px] text-zinc-300" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs text-zinc-500">عنوان</p>
                <p className="mt-1 text-sm text-zinc-200">{game.reviewSiteTitle || "-"}</p>
                <p className="mt-3 text-xs text-zinc-500">منبع</p>
                <p className="mt-1 text-sm text-zinc-200">{game.reviewSource || "-"}</p>
                <p className="mt-3 text-xs text-zinc-500">لینک</p>
                <p className="mt-1 break-all text-sm text-zinc-200">{game.reviewLink || "-"}</p>
              </div>

              <div className="space-y-2">
                {reviewItems.length ? (
                  reviewItems.map((item, index) => (
                    <div className="rounded-xl border border-zinc-800 bg-black p-3" key={`${item.title}-${index}`}>
                      <p className="text-sm font-medium text-white">{item.title || "عنوان نقد"}</p>
                      <p className="mt-1 break-all text-xs text-zinc-400">{item.link || "-"}</p>
                    </div>
                  ))
                ) : (
                  <SkeletonBlock className="h-24 w-full" />
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-zinc-800">
                {specs.map(([label, value]) => (
                  <div className="grid grid-cols-[120px_1fr] border-b border-zinc-800 last:border-b-0" key={String(label)}>
                    <div className="bg-black px-3 py-3 text-xs text-zinc-500">{label}</div>
                    <div className="px-3 py-3 text-xs text-zinc-200">
                      {valueOrSkeleton(value)}
                    </div>
                  </div>
                ))}
              </div>

              {game.platformSizes?.length ? (
                <div className="rounded-xl border border-zinc-800 bg-black p-4">
                  <p className="mb-3 text-xs font-bold text-zinc-500">حجم نسخه‌ها</p>
                  <div className="space-y-2">
                    {game.platformSizes.map((item, index) => (
                      <div className="grid gap-2 text-xs text-zinc-200 md:grid-cols-[90px_1fr_90px]" key={`${item.platform}-${index}`}>
                        <span className="rounded-lg bg-zinc-900 px-3 py-2">{item.platform || "-"}</span>
                        <span className="rounded-lg bg-zinc-900 px-3 py-2">{item.variant || "-"}</span>
                        <span className="rounded-lg bg-zinc-900 px-3 py-2">{item.size || "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
