import { Bookmark, MessageCircle, Heart, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SkeletonBlock } from "../../../components/cards";
import type { Article, Game } from "../../../lib/api";
import { formatPersianDate, getApiItem, mediaUrl } from "../../../lib/api";

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const article = await getApiItem<Article>("/articles", id);

  return {
    title: article ? `${article.title} | بازی بازار` : "مجله | بازی بازار",
    description: article?.excerpt,
  };
}

function ActionRail({ article }: { article: Article }) {
  const items = [
    { icon: MessageCircle, count: article.commentsCount ? String(article.commentsCount) : "۵۵", label: "دیدگاه" },
    { icon: Heart, count: article.likes ? String(article.likes) : "۳", label: "پسندیدن" },
    { icon: Bookmark, count: "", label: "ذخیره" },
    { icon: Share2, count: "", label: "اشتراک‌گذاری" },
  ];

  return (
    <aside className="absolute -right-12 top-3 z-10 hidden flex-col items-center gap-5 text-zinc-500 lg:flex">
      {items.map(({ count, icon: Icon, label }) => (
        <div className="text-center" key={label}>
          <Icon className="mx-auto h-5 w-5 text-zinc-500 transition hover:text-zinc-700" />
          <span className="mt-0.5 block min-h-3 text-[10px] text-zinc-500">{count}</span>
        </div>
      ))}
      <span className="relative mt-2 h-28 w-1 overflow-hidden rounded-full bg-zinc-200">
        <span className="absolute inset-x-0 top-0 h-1/3 bg-orange-600" />
      </span>
    </aside>
  );
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getApiItem<Article>("/articles", id);

  if (!article) notFound();

  const image = mediaUrl(article.cover);
  const date = formatPersianDate(article.publishedAt || article.createdAt);
  const tags = article.tags?.map((tag) => tag.name).filter(Boolean) || [];
  const relatedItems = article.relatedGames?.slice(0, 6) || [];
  const faqs = article.faqs?.filter((item) => item.question || item.answer) || [];
  const relatedCards: Array<Partial<Game>> = relatedItems.length
    ? relatedItems
    : Array.from({ length: 5 }, () => ({}));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-950">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/articles"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-950"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به مجله
        </Link>

        <article className="relative mx-auto w-full border border-zinc-200 bg-white px-4 py-8 md:px-8" dir="rtl">
          <header className="space-y-6 text-center">
            {article.title ? (
              <h1 className="mx-auto max-w-3xl text-xl font-black leading-9 text-zinc-950 md:text-2xl">
                {article.title}
              </h1>
            ) : (
              <div className="space-y-3">
                <SkeletonBlock className="mx-auto h-6 w-4/5 bg-zinc-200" />
                <SkeletonBlock className="mx-auto h-6 w-2/3 bg-zinc-200" />
              </div>
            )}

            {article.author || date || article.readingTime ? (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-zinc-500">
                {article.author ? <span>{article.author}</span> : null}
                {date ? <span>{date}</span> : null}
                {article.readingTime ? <span>{article.readingTime}</span> : null}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <SkeletonBlock className="h-3 w-20 bg-zinc-200" />
                <SkeletonBlock className="h-3 w-24 bg-zinc-200" />
                <SkeletonBlock className="h-3 w-16 bg-zinc-200" />
              </div>
            )}
          </header>

          <div className="mt-6">
            <div className="relative mx-auto max-w-[760px]">
              <div className="overflow-hidden bg-zinc-900">
                {image ? (
                  <img alt={article.title} className="aspect-[16/10] w-full object-cover" src={image} />
                ) : (
                  <SkeletonBlock className="aspect-[16/10] w-full rounded-none bg-zinc-200" />
                )}
              </div>

              <ActionRail article={article} />

              {article.excerpt ? (
                <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-8 text-zinc-700">
                  {article.excerpt}
                </p>
              ) : (
                <div className="mx-auto mt-4 max-w-2xl space-y-2">
                  <SkeletonBlock className="h-4 w-full bg-zinc-200" />
                  <SkeletonBlock className="mx-auto h-4 w-3/4 bg-zinc-200" />
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto mt-5 flex max-w-xl items-center justify-between gap-3 bg-zinc-100 px-5 py-3">
            <div className="text-left">
              <p className="text-[10px] font-black tracking-widest text-orange-500">بازی بازار</p>
              <p className="mt-1 text-[11px] text-zinc-500">خرید و مقایسه بازی‌های روز</p>
            </div>
            <strong className="text-lg text-zinc-950">بازی بعدی‌ات را هوشمند انتخاب کن</strong>
            <button className="rounded-md bg-orange-500 px-3 py-2 text-xs font-bold text-white" type="button">
              مشاهده پیشنهادها
            </button>
          </div>

          <div
            className="article-detail-preview mx-auto mt-7 max-w-2xl text-center text-sm leading-9 text-zinc-800 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-black [&_h2]:leading-9 [&_h2]:text-zinc-950 [&_h3]:mt-7 [&_h3]:text-lg [&_h3]:font-black [&_h3]:text-zinc-950 [&_p]:my-5 [&_p]:leading-9 [&_strong]:text-zinc-950"
            dangerouslySetInnerHTML={{
              __html: article.content || "",
            }}
          />

          {!article.content ? (
            <div className="mx-auto mt-7 max-w-2xl space-y-4">
              <SkeletonBlock className="mx-auto h-5 w-1/2 bg-zinc-200" />
              <SkeletonBlock className="h-4 w-full bg-zinc-200" />
              <SkeletonBlock className="h-4 w-11/12 bg-zinc-200" />
              <SkeletonBlock className="h-4 w-full bg-zinc-200" />
              <SkeletonBlock className="mx-auto mt-8 h-5 w-2/5 bg-zinc-200" />
              <SkeletonBlock className="h-4 w-full bg-zinc-200" />
              <SkeletonBlock className="h-4 w-10/12 bg-zinc-200" />
            </div>
          ) : null}

          {faqs.length ? (
            <section className="mx-auto mt-10 max-w-2xl border-y border-zinc-200 py-6">
              <h2 className="border-r-2 border-orange-500 pr-3 text-right text-sm font-bold text-zinc-950">سوالات متداول</h2>
              <div className="mt-5 space-y-3">
                {faqs.map((item, index) => (
                  <details className="group rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right" key={`${item.question}-${index}`}>
                    <summary className="cursor-pointer list-none text-sm font-bold leading-7 text-zinc-950 marker:hidden">
                      {item.question || "سوال"}
                    </summary>
                    {item.answer ? <p className="mt-3 text-sm leading-8 text-zinc-700">{item.answer}</p> : null}
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          <footer className="mx-auto mt-10 max-w-2xl border-y border-zinc-200 py-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
              {tags.length ? <span className="text-zinc-950">برچسب‌ها:</span> : <SkeletonBlock className="h-4 w-20 bg-zinc-200" />}
              {tags.map((tag) => (
                <span className="rounded-full border border-zinc-200 px-3 py-1" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-950">
              {article.author ? <span>{article.author}</span> : <SkeletonBlock className="h-4 w-24 bg-zinc-200" />}
              <button className="rounded-full border border-[#3a3f3b] px-4 py-2 text-[11px]" type="button">
                دنبال کردن
              </button>
            </div>
          </footer>

          <section className="mx-auto mt-8 max-w-2xl">
            <h2 className="border-r-2 border-orange-500 pr-3 text-sm font-bold text-zinc-950">از دست ندهید</h2>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {relatedCards.map((game, index) => {
                const imageUrl = mediaUrl(game.cardDesktopCover) || mediaUrl(game.cover);
                const label = game.title || "";

                return (
                  <div className="w-20 shrink-0 text-center" key={game?._id || index}>
                    <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-orange-500 bg-zinc-800">
                      {imageUrl ? (
                        <img alt={label} className="h-full w-full object-cover" src={imageUrl} />
                      ) : (
                        <SkeletonBlock className="h-full w-full rounded-none bg-zinc-200" />
                      )}
                    </div>
                    {label ? (
                      <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-zinc-700">{label}</p>
                    ) : (
                      <SkeletonBlock className="mx-auto mt-2 h-3 w-14 bg-zinc-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
