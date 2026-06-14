import React from "react";
import ControlPanel from "./ControlPanel";
import { useGetApprovalMessagesQuery } from "@/services/adminApi";

const typeLabels = {
  "profile-level": "سطح پروفایل",
  game: "بازی",
  product: "محصول",
  article: "مجله",
  slider: "اسلایدر",
};

function ApprovalMessages() {
  const { data, isLoading } = useGetApprovalMessagesQuery();
  const messages = data?.data || [];

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-bold text-zinc-500">پیام‌های بازبینی</p>
          <h1 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">ایرادهای ثبت‌شده</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            علت رد شدن محتواها اینجا نمایش داده می‌شود تا اپراتور بتواند مورد را اصلاح کند.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
              ))}
            </div>
          ) : messages.length ? (
            <div className="space-y-3">
              {messages.map((item) => (
                <article
                  key={`${item.type}-${item._id}-${item.reviewedAt || item.updatedAt}`}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 dark:bg-red-500/15 dark:text-red-300">
                          رد شده
                        </span>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {typeLabels[item.type] || item.type}
                        </span>
                      </div>
                      <h2 className="mt-3 truncate text-base font-black text-zinc-950 dark:text-white">{item.title}</h2>
                    </div>
                    <time className="shrink-0 text-xs text-zinc-500">
                      {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString("fa-IR") : "-"}
                    </time>
                  </div>
                  <p className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm leading-7 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    {item.reason || "علتی ثبت نشده است."}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
              پیامی برای نمایش وجود ندارد.
            </div>
          )}
        </div>
      </section>
    </ControlPanel>
  );
}

export default ApprovalMessages;
