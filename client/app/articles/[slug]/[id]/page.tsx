import { Bookmark, Eye, MessageCircle, Heart, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { SkeletonBlock } from "../../../components/cards";
import type { Article, Game, NamedEntity } from "../../../lib/api";
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
    { icon: Eye, count: article.views ? article.views.toLocaleString("fa-IR") : "۰", label: "بازدید" },
    { icon: MessageCircle, count: article.commentsCount ? article.commentsCount.toLocaleString("fa-IR") : "۰", label: "دیدگاه" },
    { icon: Heart, count: article.likes ? article.likes.toLocaleString("fa-IR") : "۰", label: "پسندیدن" },
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

function getCategoryPath(category?: NamedEntity | null) {
  const path: string[] = [];
  let current = category;
  let guard = 0;

  while (current?.name && guard < 5) {
    path.unshift(current.name);
    current = current.parent || null;
    guard += 1;
  }

  return path;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getApiItem<Article>("/articles", id);

  if (!article) notFound();

  const image = mediaUrl(article.cover);
  const authorImage = mediaUrl(article.authorAvatar);
  const date = formatPersianDate(article.publishedAt || article.createdAt);
  const categoryPath = getCategoryPath(article.category);
  const tags = article.tags?.map((tag) => tag.name).filter(Boolean) || [];
  const relatedItems = article.relatedGames?.slice(0, 6) || [];
  const faqs = article.faqs?.filter((item) => item.question || item.answer) || [];
  const relatedCards: Array<Partial<Game>> = relatedItems.length
    ? relatedItems
    : Array.from({ length: 5 }, () => ({}));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-950">
      <main className="mx-auto max-w-6xl px-3 py-3 sm:px-4 lg:px-5">
        <article className="relative mx-auto w-full bg-white px-3 py-4 md:px-5" dir="rtl">
          <header className="space-y-4">
            {article.title ? (
              <h1 className="mx-auto max-w-4xl text-center text-2xl font-black leading-10 text-zinc-950 md:text-3xl">
                {article.title}
              </h1>
            ) : (
              <div className="mx-auto max-w-3xl space-y-3">
                <SkeletonBlock className="mx-auto h-6 w-4/5 bg-zinc-200" />
                <SkeletonBlock className="mx-auto h-6 w-2/3 bg-zinc-200" />
              </div>
            )}

            <div>
              <div className="mb-4 flex justify-start">
                <div className="flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 text-right text-[12px] font-bold text-zinc-600">
                  <div className="flex items-center gap-2">
                    {authorImage ? (
                      <img alt={article.author || "نویسنده"} className="h-10 w-10 rounded-full object-cover" src={authorImage} />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-900 text-center text-base font-black leading-10 text-white">
                        {(article.author || "بازی بازار").slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="mt-0.5 text-sm font-black text-zinc-950">{article.author || "تحریریه بازی بازار"}</p>
                    </div>
                  </div>
                  <span className="hidden h-5 w-px bg-zinc-300 sm:block" />
                  <span>{categoryPath.length ? categoryPath.join(" / ") : "بدون دسته‌بندی"}</span>
                  <span className="hidden h-5 w-px bg-zinc-300 sm:block" />
                  <span>{date || "-"}</span>
                  <span className="hidden h-5 w-px bg-zinc-300 sm:block" />
                  <span>{article.views ? article.views.toLocaleString("fa-IR") : "۰"} بازدید</span>
                  {article.readingTime ? (
                    <>
                      <span className="hidden h-5 w-px bg-zinc-300 sm:block" />
                      <span>{article.readingTime}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden bg-zinc-900">
                  {image ? (
                    <img alt={article.title} className="aspect-[16/10] w-full object-cover" src={image} />
                  ) : (
                    <SkeletonBlock className="aspect-[16/10] w-full rounded-none bg-zinc-200" />
                  )}
                </div>
                <ActionRail article={article} />

                {article.excerpt ? (
                  <p className="mt-4 text-right text-sm leading-8 text-zinc-700">{article.excerpt}</p>
                ) : (
                  <div className="mt-4 space-y-2">
                    <SkeletonBlock className="h-4 w-full bg-zinc-200" />
                    <SkeletonBlock className="h-4 w-3/4 bg-zinc-200" />
                  </div>
                )}
              </div>
            </div>
          </header>

          <div
            className="article-detail-preview mx-auto mt-5 max-w-3xl text-right text-sm leading-9 text-zinc-800 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-black [&_h2]:leading-9 [&_h2]:text-zinc-950 [&_h3]:mt-7 [&_h3]:text-lg [&_h3]:font-black [&_h3]:text-zinc-950 [&_p]:my-5 [&_p]:leading-9 [&_strong]:text-zinc-950"
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

          <section className="mx-auto max-w-3xl px-8 py-14" dir="rtl">
            <div className="text-right">
              <h2 className="text-lg font-bold text-zinc-700 sm:text-xl">سوالات متداول</h2>
            </div>
            <ul className="mt-6">
              {faqs.length ? (
                faqs.map((item, index) => (
                  <details className="group [&_summary::-webkit-details-marker]:hidden" key={`${item.question}-${index}`}>
                    <summary className="relative flex w-full cursor-pointer list-none items-center gap-3 border-t border-zinc-300 py-5 text-right text-base font-semibold text-zinc-950 marker:hidden md:text-lg">
                      <svg className="h-4 w-4 shrink-0 fill-current text-zinc-950" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <rect y="7" width="16" height="2" rx="1" className="origin-center transition duration-200 ease-out" />
                        <rect y="7" width="16" height="2" rx="1" className="origin-center rotate-90 transition duration-200 ease-out group-open:rotate-0" />
                      </svg>
                      <span className="flex-1">{item.question || "سوال"}</span>
                    </summary>
                    <div className="grid grid-rows-[0fr] overflow-hidden transition-all duration-300 ease-in-out group-open:grid-rows-[1fr]">
                      <div className="min-h-0 overflow-hidden">
                        <div className="pb-5 leading-relaxed">
                          <div className="space-y-2 leading-relaxed text-zinc-600">{item.answer}</div>
                        </div>
                      </div>
                    </div>
                  </details>
                ))
              ) : (
                Array.from({ length: 2 }, (_, index) => (
                  <li className="border-t border-zinc-300 py-5" key={index}>
                    <div className="flex items-center gap-3">
                      <SkeletonBlock className="h-5 flex-1 bg-zinc-200" />
                      <SkeletonBlock className="h-4 w-4 bg-zinc-200" />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

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
