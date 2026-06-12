import React, { useRef, useState } from "react";
import ArticleBookmark from "@/components/icons/ArticleBookmark";
import ArticleComment from "@/components/icons/ArticleComment";
import ArticleHeart from "@/components/icons/ArticleHeart";
import ArticleShare from "@/components/icons/ArticleShare";

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800/30 ${className}`} />;
}

function formatPublishedDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fa-IR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ArticleCardPreview({ coverPreview, form }) {
  const title = form.title.trim();

  return (
    <div className="sticky top-24 flex justify-center space-y-4" dir="rtl">
      <div className="w-full max-w-[230px] space-y-2" dir="rtl">
        <div className="aspect-square overflow-hidden rounded-xl bg-zinc-900">
          {coverPreview ? (
            <img alt={title} className="h-full w-full object-cover" src={coverPreview} />
          ) : (
            <SkeletonBlock className="h-full w-full rounded-xl" />
          )}
        </div>
        {title ? (
          <h3 className="line-clamp-2 text-right text-md font-bold leading-5 text-white">{title}</h3>
        ) : (
          <SkeletonBlock className="h-4 w-2/3" />
        )}
      </div>
    </div>
  );
}

export function ArticleDetailPreview({ coverPreview, form, isSticky = true, relatedGames = [], tags = [], variant = "desktop" }) {
  const isMobile = variant === "mobile";
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const title = form.title.trim();
  const publishedDate = formatPublishedDate(form.publishedAt);
  const content = form.content.trim();
  const excerpt = form.excerpt.trim();
  const faqs = Array.isArray(form.faqs) ? form.faqs.filter((item) => item?.question || item?.answer) : [];
  const relatedItems = relatedGames.slice(0, 6);
  const sidebarItems = [
    { icon: ArticleComment, count: "۵۵", label: "دیدگاه" },
    { icon: ArticleHeart, count: "۳", label: "پسندیدن" },
    { icon: ArticleBookmark, count: "", label: "ذخیره" },
    { icon: ArticleShare, count: "", label: "اشتراک‌گذاری" },
  ];

  const handleScroll = (event) => {
    const element = event.currentTarget;
    const maxScroll = element.scrollHeight - element.clientHeight;
    setScrollProgress(maxScroll > 0 ? Math.min(element.scrollTop / maxScroll, 1) : 0);
  };

  const actionRail = (
    <aside
      className={`z-10 flex text-zinc-500 ${
        isMobile
          ? "absolute right-2 top-2 max-h-[calc(100%-16px)] flex-col gap-2 rounded-full bg-white/55 px-1.5 py-2 shadow-md shadow-black/5 backdrop-blur-sm"
          : "absolute -right-12 top-3 flex-col items-center gap-5"
      }`}
    >
      {sidebarItems.map(({ count, icon: Icon, label }) => (
        <div className="text-center" key={label}>
          <Icon className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mx-auto text-zinc-500 transition hover:text-zinc-700`} />
          <span className={`mt-0.5 block min-h-3 text-zinc-500 ${isMobile ? "text-[9px]" : "text-[10px]"}`}>{count}</span>
        </div>
      ))}
      <span className={`relative overflow-hidden rounded-full bg-zinc-200 ${isMobile ? "mx-auto h-24 w-1" : "mt-2 h-28 w-1"}`}>
        <span
          className="absolute inset-x-0 top-0 bg-orange-600 transition-[height] duration-150"
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </span>
    </aside>
  );

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={`${isSticky ? "sticky top-24 max-h-[760px]" : "mx-auto my-6 max-h-[calc(100vh-48px)]"} overflow-y-auto border border-zinc-200 bg-white text-zinc-950 ${
        isMobile ? "mx-auto w-full max-w-[370px]" : ""
      }`}
      dir="rtl"
    >
      <article className={`relative mx-auto w-full px-4 py-8 ${isMobile ? "max-w-[370px]" : "max-w-[760px] md:px-8"}`}>
        <header className="space-y-6 text-center">
          {title ? (
            <h2 className={`mx-auto max-w-3xl font-black leading-9 text-zinc-950 ${isMobile ? "text-lg" : "text-xl md:text-2xl"}`}>{title}</h2>
          ) : (
            <div className="space-y-3">
              <SkeletonBlock className="mx-auto h-6 w-4/5 bg-zinc-200" />
              <SkeletonBlock className="mx-auto h-6 w-2/3 bg-zinc-200" />
            </div>
          )}
          {form.author || publishedDate || form.readingTime ? (
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-zinc-500">
              {form.author ? <span>{form.author}</span> : null}
              {publishedDate ? <span>{publishedDate}</span> : null}
              {form.readingTime ? <span>{form.readingTime}</span> : null}
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
          <div className="relative">
            <div className="overflow-hidden bg-zinc-900">
              {coverPreview ? (
                <img alt={title} className={`${isMobile ? "aspect-[4/3]" : "aspect-[16/10]"} w-full object-cover`} src={coverPreview} />
              ) : (
                <SkeletonBlock className={`${isMobile ? "aspect-[4/3]" : "aspect-[16/10]"} w-full rounded-none bg-zinc-200`} />
              )}
            </div>
            {actionRail}
            {excerpt ? (
              <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-8 text-zinc-700">{excerpt}</p>
            ) : (
              <div className="mx-auto mt-4 max-w-2xl space-y-2">
                <SkeletonBlock className="h-4 w-full bg-zinc-200" />
                <SkeletonBlock className="mx-auto h-4 w-3/4 bg-zinc-200" />
              </div>
            )}
          </div>
        </div>

        <div className={`mx-auto mt-5 flex max-w-xl items-center justify-between gap-3 bg-zinc-100 px-5 py-3 ${isMobile ? "flex-col text-center" : ""}`}>
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
            __html: content,
          }}
        />
        {!content ? (
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
                <details className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right" key={`${item.question}-${index}`}>
                  <summary className="cursor-pointer list-none text-sm font-bold leading-7 text-zinc-950">{item.question || "سوال"}</summary>
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
            {form.author ? <span>{form.author}</span> : <SkeletonBlock className="h-4 w-24 bg-zinc-200" />}
            <button className="rounded-full border border px-4 py-2 text-[11px]" type="button">
              دنبال کردن
            </button>
          </div>
        </footer>

        <section className="mx-auto mt-8 max-w-2xl">
          <h3 className="border-r-2 border-orange-500 pr-3 text-sm font-bold text-zinc-950">از دست ندهید</h3>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {(relatedItems.length ? relatedItems : Array.from({ length: 5 })).map((game, index) => {
              const image = game?.cardDesktopCover?.url || game?.cover?.url || "";
              const label = game?.title || "";

              return (
                <div className="w-20 shrink-0 text-center" key={game?._id || index}>
                  <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-orange-500 bg-zinc-800">
                    {image ? <img alt={label} className="h-full w-full object-cover" src={image} /> : <SkeletonBlock className="h-full w-full rounded-none bg-zinc-200" />}
                  </div>
                  {label ? <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-zinc-700">{label}</p> : <SkeletonBlock className="mx-auto mt-2 h-3 w-14 bg-zinc-200" />}
                </div>
              );
            })}
          </div>
        </section>
      </article>
    </div>
  );
}

