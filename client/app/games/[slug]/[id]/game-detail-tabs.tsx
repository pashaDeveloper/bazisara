"use client";

import { Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Game, NamedEntity } from "../../../lib/api";

type SpecRow = {
  label: string;
  value?: string | number | null;
};

type DownloadLink = NonNullable<Game["platformDownloadLinks"]>[number];

type GameDetailTabsProps = {
  description: string;
  downloads?: DownloadLink[];
  reviewItems?: Game["reviewItems"];
  reviewLink?: string;
  reviewSiteTitle?: string;
  reviewSource?: string;
  specs: SpecRow[];
};

type TabKey = "intro" | "specs" | "review" | "downloads";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "intro", label: "معرفی" },
  { key: "specs", label: "مشخصات" },
  { key: "review", label: "نقد و بررسی" },
  { key: "downloads", label: "لینک‌های دانلود" },
];

function latinToPersian(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function compactValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return latinToPersian(value);
}

function entityLabel(value?: string | NamedEntity | null) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name_fa || value.name || value.name_en || value.slug || "";
}

function downloadTitle(item: DownloadLink, index: number) {
  return item.platformTitle || entityLabel(item.platform) || item.titleId || `لینک دانلود ${latinToPersian(index + 1)}`;
}

function hasReviewContent({
  reviewItems,
  reviewLink,
  reviewSiteTitle,
  reviewSource,
}: Pick<GameDetailTabsProps, "reviewItems" | "reviewLink" | "reviewSiteTitle" | "reviewSource">) {
  return Boolean(reviewSiteTitle || reviewSource || reviewLink || reviewItems?.length);
}

function IntroTab({ description }: { description: string }) {
  return (
    <section id="intro" className="bg-white px-4 py-5 lg:mx-auto lg:mt-4 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-6">
      {description ? (
        <>
          <h2 className="mb-3 text-[15px] font-black text-[#29467c]">معرفی</h2>
          <p className="text-[13px] leading-8 text-[#475166]">{description}</p>
        </>
      ) : (
        <div className="min-h-28 rounded-lg bg-white" />
      )}
    </section>
  );
}

function SpecsTab({ specs }: { specs: SpecRow[] }) {
  return (
    <section id="specs" className="bg-white px-4 py-5 lg:mx-auto lg:mt-4 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-6">
      <div className="overflow-hidden rounded-xl border border-[#e9edf4]">
        {specs.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[116px_minmax(0,1fr)] border-b border-[#eef2f6] last:border-b-0 lg:grid-cols-[180px_minmax(0,1fr)]"
            dir="rtl"
          >
            <div className="bg-[#fbfcfe] px-4 py-4 text-right text-[12px] font-black text-[#29467c]">{item.label}</div>
            <div className="px-4 py-4 text-right text-[12px] font-medium leading-6 text-[#3d465b]">{compactValue(item.value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewTab(props: Pick<GameDetailTabsProps, "reviewItems" | "reviewLink" | "reviewSiteTitle" | "reviewSource">) {
  return (
    <section id="review" className="bg-white px-4 py-5 lg:mx-auto lg:mt-4 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-6">
      <h2 className="mb-4 text-[15px] font-black text-[#29467c]">نقد و بررسی</h2>
      {hasReviewContent(props) ? (
        <div className="grid gap-3 text-[13px] leading-7 text-[#475166]">
          {props.reviewSiteTitle ? <p>{props.reviewSiteTitle}</p> : null}
          {props.reviewSource ? <p>منبع: {props.reviewSource}</p> : null}
          {props.reviewLink ? (
            <a className="inline-flex items-center gap-2 break-all font-bold text-[#ef476f]" href={props.reviewLink} rel="noreferrer" target="_blank">
              لینک نقد و بررسی
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
          {props.reviewItems?.map((item, index) =>
            item.link ? (
              <a className="inline-flex items-center gap-2 break-all text-[#475166] hover:text-[#ef476f]" href={item.link} key={`${item.title}-${index}`} rel="noreferrer" target="_blank">
                {item.title || item.link}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p key={`${item.title}-${index}`}>{item.title}</p>
            ),
          )}
        </div>
      ) : (
        <p className="text-[13px] leading-7 text-[#7c8598]">نقد و بررسی برای این بازی ثبت نشده است.</p>
      )}
    </section>
  );
}

function DownloadsTab({ downloads = [] }: { downloads?: DownloadLink[] }) {
  const visibleDownloads = downloads.filter((item) => item.downloadUrl || item.parts?.length || item.sourceUrl);

  return (
    <section id="downloads" className="bg-white px-4 py-5 lg:mx-auto lg:mt-4 lg:max-w-[1440px] lg:rounded-xl lg:border lg:border-[#e8ecf3] lg:p-6">
      <h2 className="mb-4 text-[15px] font-black text-[#29467c]">لینک‌های دانلود</h2>
      {visibleDownloads.length ? (
        <div className="grid gap-3">
          {visibleDownloads.map((item, index) => (
            <article className="rounded-xl border border-[#e9edf4] p-4" key={`${item.titleId}-${item.version}-${index}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[13px] font-black text-[#2d3d66]">{downloadTitle(item, index)}</h3>
                  <p className="mt-1 text-[12px] leading-6 text-[#7c8598]">
                    {[item.version, item.regionDescription || item.region, item.size].filter(Boolean).join(" | ") || "نسخه دانلود"}
                  </p>
                </div>
                {item.downloadUrl ? (
                  <a className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#ff3f68] px-4 text-[12px] font-black text-white" href={item.downloadUrl} rel="noreferrer" target="_blank">
                    <Download className="h-4 w-4" />
                    دانلود
                  </a>
                ) : null}
              </div>
              {item.notes ? <p className="mt-3 text-[12px] leading-6 text-[#5f697d]">{item.notes}</p> : null}
              {item.parts?.length ? (
                <div className="mt-4 grid gap-2">
                  {item.parts.map((part, partIndex) => (
                    <a
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#edf1f6] px-3 py-3 text-[12px] font-bold text-[#3d465b] hover:border-[#ff3f68] hover:text-[#ef476f]"
                      href={part.url}
                      key={`${part.url}-${partIndex}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="min-w-0 truncate">{part.fileName || `پارت ${latinToPersian(part.partNumber || partIndex + 1)}`}</span>
                      <span className="shrink-0 text-[#8a92a3]">{part.size}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-[13px] leading-7 text-[#7c8598]">لینک دانلود برای این بازی ثبت نشده است.</p>
      )}
    </section>
  );
}

export function GameDetailTabs({
  description,
  downloads,
  reviewItems,
  reviewLink,
  reviewSiteTitle,
  reviewSource,
  specs,
}: GameDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("intro");

  return (
    <>
      <nav className="sticky top-12 z-10 mt-4 flex justify-start gap-8 overflow-x-auto border-y border-[#edf1f6] bg-white px-4 text-[13px] font-bold text-[#7c8598] lg:top-0 lg:mx-auto lg:max-w-[1440px] lg:rounded-xl lg:border lg:px-8" dir="rtl">
        {tabs.map((tab) => (
          <button
            className={`relative shrink-0 py-4 transition ${tab.key === activeTab ? "text-[#ef476f]" : "hover:text-[#29467c]"}`}
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
            {tab.key === activeTab ? <span className="absolute bottom-0 right-0 h-0.5 w-full rounded-full bg-[#ff3f68]" /> : null}
          </button>
        ))}
      </nav>

      {activeTab === "intro" ? <IntroTab description={description} /> : null}
      {activeTab === "specs" ? <SpecsTab specs={specs} /> : null}
      {activeTab === "review" ? <ReviewTab reviewItems={reviewItems} reviewLink={reviewLink} reviewSiteTitle={reviewSiteTitle} reviewSource={reviewSource} /> : null}
      {activeTab === "downloads" ? <DownloadsTab downloads={downloads} /> : null}
    </>
  );
}
