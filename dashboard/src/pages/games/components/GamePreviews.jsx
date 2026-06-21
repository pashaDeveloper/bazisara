import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { parseInputDate, stripHtml } from "../gameFormUtils";

export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800/20 ${className}`} />;
}

export function GameCardPreview({ coverPreview, form }) {
  const title = form.title.trim();

  return (
    <div className="sticky top-24 flex justify-center space-y-4" dir="rtl">
      <div className="w-full max-w-[230px] space-y-2" dir="ltr">
        <div className="aspect-square overflow-hidden rounded-xl bg-zinc-900">
          {coverPreview ? (
            <img alt={title} className="h-full w-full object-cover" src={coverPreview} />
          ) : (
            <SkeletonBlock className="h-full w-full rounded-xl" />
          )}
        </div>
        {title ? (
          <h3 className="line-clamp-2 text-left text-md font-bold leading-5 text-white">{title}</h3>
        ) : (
          <SkeletonBlock className="h-4 w-2/3" />
        )}
      </div>
    </div>
  );
}

export function GameDetailPreview({
  activeTab,
  cardMobileCoverPreview = "",
  coverPreview,
  desktopCoverPreview = "",
  form,
  galleryPreview,
  genres,
  isSticky = true,
  onTabChange,
  platforms,
  platformReleases = [],
  reviewItems = [],
  seoTags = [],
  variant = "desktop",
}) {
  const isMobile = variant === "mobile";
  const heroImage =
    (isMobile ? cardMobileCoverPreview || coverPreview : desktopCoverPreview || coverPreview) ||
    galleryPreview[0]?.url ||
    "";
  const title = form.title.trim();
  const description = stripHtml(form.description) || form.shortDescription.trim();
  const tabButtonRefs = useRef([]);
  const tabRowRef = useRef(null);
  const [localActiveTab, setLocalActiveTab] = useState("specs");
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, right: 0 });
  const resolvedActiveTab = activeTab || localActiveTab;
  const detailTabs = [
    { key: "intro", label: "معرفی" },
    { key: "review", label: "نقد و بررسی" },
    { key: "specs", label: "مشخصات" },
    { key: "comments", label: "دیدگاه‌ها" },
  ];
  const activeTabIndex = Math.max(detailTabs.findIndex((tab) => tab.key === resolvedActiveTab), 0);

  const platformSizes = useMemo(() => form.platformSizes || [], [form.platformSizes]);
  const releaseSummary = platformReleases
    .map((item) => {
      const date = parseInputDate(item.releaseDate)?.toLocaleDateString("fa-IR");
      return [item.label, date].filter(Boolean).join(": ");
    })
    .filter(Boolean)
    .join("، ");
  const specs = [
    ["پلتفرم", platforms.join("، ")],
    ["نسخه", form.edition],
    ["سرویس انتشار", Array.isArray(form.launcher) ? form.launcher.join("، ") : form.launcher],
    ["تاریخ انتشار", releaseSummary],
    ["رده سنی", form.ageRating],
    ["زمان تقریبی گیم‌پلی", form.gameplayTime],
    ["امتیاز متاکریتیک", form.metacriticScore],
    ["ژانرها", genres.join("، ")],
  ];

  useLayoutEffect(() => {
    const container = tabRowRef.current;
    const button = tabButtonRefs.current[activeTabIndex];
    if (!container || !button) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    setIndicatorStyle({
      width: buttonRect.width,
      right: containerRect.right - buttonRect.right,
    });
  }, [activeTabIndex, resolvedActiveTab, isMobile]);

  const handleTabClick = (tabKey) => {
    setLocalActiveTab(tabKey);
    onTabChange?.(tabKey);
  };

  const renderActiveTab = () => {
    switch (resolvedActiveTab) {
      case "intro":
        return (
          <div className="space-y-3">
            {form.shortDescription ? <p className="text-sm leading-7 text-zinc-300">{form.shortDescription}</p> : null}
            {description ? <p className="line-clamp-5 text-sm leading-7 text-zinc-300">{description}</p> : <SkeletonBlock className="h-4 w-full" />}
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
        );
      case "review":
        return (
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-800 bg-black p-4">
              <p className="text-xs text-zinc-500">عنوان</p>
              <p className="mt-1 text-sm text-zinc-200">{form.reviewSiteTitle || "-"}</p>
              <p className="mt-3 text-xs text-zinc-500">منبع</p>
              <p className="mt-1 text-sm text-zinc-200">{form.reviewSource || "-"}</p>
              <p className="mt-3 text-xs text-zinc-500">لینک</p>
              <p className="mt-1 break-all text-sm text-zinc-200">{form.reviewLink || "-"}</p>
            </div>
            <div className="space-y-2">
              {reviewItems.length ? reviewItems.map((item, index) => (
                <div className="rounded-xl border border-zinc-800 bg-black p-3" key={`${item.title}-${index}`}>
                  <p className="text-sm font-medium text-white">{item.title || "عنوان نقد"}</p>
                  <p className="mt-1 break-all text-xs text-zinc-400">{item.link || "-"}</p>
                </div>
              )) : <SkeletonBlock className="h-24 w-full" />}
            </div>
          </div>
        );
      case "comments":
        return (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div className="rounded-xl border border-zinc-800 bg-black p-3" key={item}>
                <SkeletonBlock className="mb-3 h-4 w-24" />
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="mt-2 h-3 w-3/4" />
              </div>
            ))}
          </div>
        );
      case "specs":
      default:
        return (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              {specs.map(([label, value]) => (
                <div
                  className={`grid border-b border-zinc-800 last:border-b-0 ${
                    isMobile ? "grid-cols-[96px_1fr]" : "grid-cols-[120px_1fr]"
                  }`}
                  key={label}
                >
                  <div className="bg-black px-3 py-3 text-xs text-zinc-500">{label}</div>
                  <div className="px-3 py-3 text-xs text-zinc-200">
                    {value ? value : <SkeletonBlock className="h-4 w-20" />}
                  </div>
                </div>
              ))}
            </div>
            {platformSizes.length ? (
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="mb-3 text-xs font-bold text-zinc-500">حجم نسخه‌ها</p>
                <div className="space-y-2">
                  {platformSizes.map((item, index) => (
                    <div className="grid gap-2 text-xs text-zinc-200 md:grid-cols-[120px_1fr_120px]" key={`${item.platform}-${index}`}>
                      <span className="rounded-lg bg-zinc-900 px-3 py-2">{item.platform || "-"}</span>
                      <span className="rounded-lg bg-zinc-900 px-3 py-2">{item.variant || "-"}</span>
                      <span className="rounded-lg bg-zinc-900 px-3 py-2">{item.size || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
    }
  };

  return (
    <div
      className={`overflow-hidden border border-zinc-800 bg-zinc-950 ${
        isMobile ? "no-scrollbar max-h-[720px] w-full max-w-[360px] overflow-y-auto" : `${isSticky ? "sticky top-24" : ""}`
      }`}
      dir="rtl"
    >
      <div className={`relative bg-zinc-900 ${isMobile ? "h-52" : "h-64"}`}>
        {heroImage ? <img alt={title} className="h-full w-full object-cover" src={heroImage} /> : <SkeletonBlock className="h-full w-full rounded-none" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
        <div
          className={`absolute rounded-xl border border-white/10 bg-white/90 text-zinc-950 shadow-xl ${
            isMobile ? "inset-x-3 bottom-3 p-3" : "bottom-4 left-4 w-72 p-4"
          }`}
        >
          {title ? (
            <h3 className={`line-clamp-2 font-black ${isMobile ? "text-base" : "text-lg"}`}>{title}</h3>
          ) : (
            <SkeletonBlock className="h-6 w-3/4 bg-zinc-300/25" />
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
            {[form.edition, form.ageRating, form.metacriticScore].map((value, index) => (
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
        </div>
      </div>

      <div className="border-b border-zinc-800 bg-black px-4 py-3">
        <div className={`relative flex text-xs text-zinc-400 ${isMobile ? "gap-4 overflow-x-auto whitespace-nowrap" : "gap-6"}`} ref={tabRowRef}>
          <span
            className="absolute bottom-0 h-0.5 rounded-full bg-red-500 transition-all duration-300 ease-out"
            style={{ right: indicatorStyle.right, width: indicatorStyle.width }}
          />
          {detailTabs.map((tab, index) => {
            const isActive = resolvedActiveTab === tab.key;

            return (
              <button
                className={`group relative pb-3 pt-1 text-xs transition ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`}
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                ref={(node) => {
                  tabButtonRefs.current[index] = node;
                }}
                type="button"
              >
                {tab.label}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-right scale-x-0 rounded-full bg-red-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </button>
            );
          })}
        </div>
      </div>

      <div className={`space-y-5 ${isMobile ? "p-3" : "p-4"}`}>
        {renderActiveTab()}
      </div>
    </div>
  );
}

