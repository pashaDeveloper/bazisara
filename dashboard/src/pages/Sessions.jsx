import React from "react";
import ControlPanel from "./ControlPanel";
import { useGetAnalyticsSummaryQuery } from "../services/analyticsApi";

function formatNumber(value) {
  return new Intl.NumberFormat("fa-IR").format(Number(value || 0));
}

function formatDuration(ms) {
  const totalSeconds = Math.round(Number(ms || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${formatNumber(minutes)}:${String(seconds).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function Sessions() {
  const { data, isLoading, isFetching } = useGetAnalyticsSummaryQuery(undefined, {
    pollingInterval: 30000,
  });

  const summary = data?.data || {};
  const totals = summary.totals || {};
  const recentSessions = summary.recentSessions || [];

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">نشست‌های کاربران سایت</p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">نشست‌ها</h1>
            </div>
            <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              {isFetching ? "در حال به‌روزرسانی" : "به‌روز"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-400">نشست امروز</p>
            <p className="mt-4 text-2xl font-black text-white">{formatNumber(totals.sessionsToday)}</p>
          </article>
          <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-400">کاربر فعال</p>
            <p className="mt-4 text-2xl font-black text-white">{formatNumber(totals.activeSessions)}</p>
          </article>
          <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-400">کل نشست‌ها</p>
            <p className="mt-4 text-2xl font-black text-white">{formatNumber(totals.totalSessions)}</p>
          </article>
        </div>

        <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">لیست نشست‌ها</h2>
            <span className="text-xs text-zinc-500">{formatNumber(recentSessions.length)} مورد اخیر</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 font-medium">بازدیدکننده</th>
                  <th className="pb-3 font-medium">IP</th>
                  <th className="pb-3 font-medium">دستگاه</th>
                  <th className="pb-3 font-medium">مرورگر</th>
                  <th className="pb-3 font-medium">سیستم‌عامل</th>
                  <th className="pb-3 font-medium">ورودی</th>
                  <th className="pb-3 font-medium">آخرین صفحه</th>
                  <th className="pb-3 font-medium">مدت حضور</th>
                  <th className="pb-3 font-medium">آخرین فعالیت</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-8 text-center text-zinc-500" colSpan="9">
                      در حال دریافت نشست‌ها...
                    </td>
                  </tr>
                ) : recentSessions.length ? (
                  recentSessions.map((session) => (
                    <tr key={session._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="max-w-36 truncate py-3">{session.visitorId}</td>
                      <td className="py-3">{session.ip || "-"}</td>
                      <td className="py-3">{session.deviceType || "-"}</td>
                      <td className="py-3">{session.browser || "-"}</td>
                      <td className="py-3">{session.os || "-"}</td>
                      <td className="max-w-44 truncate py-3">{session.referrer || "مستقیم"}</td>
                      <td className="max-w-44 truncate py-3">{session.currentPath || session.landingPage || "-"}</td>
                      <td className="py-3">{formatDuration(session.durationMs)}</td>
                      <td className="py-3">{formatDate(session.lastSeenAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-8 text-center text-zinc-500" colSpan="9">
                      هنوز نشست کاربری ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </ControlPanel>
  );
}

export default Sessions;
