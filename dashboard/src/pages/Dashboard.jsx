import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import ControlPanel from "./ControlPanel";
import { useGetAnalyticsSummaryQuery } from "../services/analyticsApi";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip
);

const chartPalette = ["#38bdf8", "#34d399", "#fb7185", "#facc15", "#a78bfa", "#f97316"];

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

function StatCard({ title, value, unit, accent = "from-zinc-800 to-black" }) {
  return (
    <article className={`rounded-2xl border border-zinc-700 bg-gradient-to-br ${accent} p-4 shadow-lg shadow-black/20`}>
      <p className="text-xs text-zinc-400">{title}</p>
      <p className="mt-4 text-2xl font-black text-white">{formatNumber(value)}</p>
      <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300">
        {unit}
      </span>
    </article>
  );
}

function AnalyticsChart({ title, type, data, height = 260 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const chart = new Chart(canvasRef.current, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: type === "doughnut" ? "66%" : undefined,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#d4d4d8",
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
              usePointStyle: true,
              pointStyle: "circle",
              font: { family: "Vazir, sans-serif", size: 11 },
            },
          },
          tooltip: {
            backgroundColor: "#09090b",
            borderColor: "#3f3f46",
            borderWidth: 1,
            bodyColor: "#f4f4f5",
            titleColor: "#ffffff",
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || context.label || "";
                const value = type === "doughnut" ? context.parsed : context.parsed.y;
                return `${label}: ${formatNumber(value)}`;
              },
            },
          },
        },
        scales:
          type === "bar"
            ? {
                x: {
                  grid: { display: false },
                  ticks: { color: "#a1a1aa", font: { family: "Vazir, sans-serif", size: 11 } },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: "rgba(82, 82, 91, 0.35)" },
                  ticks: {
                    color: "#a1a1aa",
                    precision: 0,
                    font: { family: "Vazir, sans-serif", size: 11 },
                  },
                },
              }
            : undefined,
      },
    });

    return () => chart.destroy();
  }, [data, type]);

  return (
    <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <div className="mt-4" style={{ height }}>
        <canvas ref={canvasRef} />
      </div>
    </article>
  );
}

function ContentTable({ title, rows, type }) {
  return (
    <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <Link className="text-xs text-zinc-400 transition hover:text-white" to={type === "game" ? "/games" : "/articles"}>
          مدیریت
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] text-right text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="pb-3 font-medium">عنوان</th>
              <th className="pb-3 font-medium">بازدید</th>
              <th className="pb-3 font-medium">لایک</th>
              <th className="pb-3 font-medium">نظر</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((item) => (
                <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                  <td className="max-w-48 truncate py-3">{item.title}</td>
                  <td className="py-3">{formatNumber(item.views)}</td>
                  <td className="py-3">{formatNumber(item.likes)}</td>
                  <td className="py-3">{formatNumber(item.commentsCount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-6 text-center text-zinc-500" colSpan="4">
                  هنوز محتوایی ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function RecentSessionsTable({ recentSessions }) {
  return (
    <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">آخرین نشست‌های کاربران</h2>
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
              <th className="pb-3 font-medium">ورودی</th>
              <th className="pb-3 font-medium">آخرین صفحه</th>
              <th className="pb-3 font-medium">مدت حضور</th>
              <th className="pb-3 font-medium">آخرین فعالیت</th>
            </tr>
          </thead>
          <tbody>
            {recentSessions.length ? (
              recentSessions.map((session) => (
                <tr key={session._id} className="border-b border-zinc-900 text-zinc-200">
                  <td className="max-w-36 truncate py-3">{session.visitorId}</td>
                  <td className="py-3">{session.ip || "-"}</td>
                  <td className="py-3">{session.deviceType || "-"}</td>
                  <td className="py-3">{session.browser || "-"}</td>
                  <td className="max-w-44 truncate py-3">{session.referrer || "مستقیم"}</td>
                  <td className="max-w-44 truncate py-3">{session.currentPath || session.landingPage || "-"}</td>
                  <td className="py-3">{formatDuration(session.durationMs)}</td>
                  <td className="py-3">{formatDate(session.lastSeenAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-8 text-center text-zinc-500" colSpan="8">
                  هنوز نشست کاربری ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Dashboard() {
  const { data, isLoading, isFetching } = useGetAnalyticsSummaryQuery(undefined, {
    pollingInterval: 30000,
  });
  const summary = data?.data || {};
  const totals = summary.totals || {};
  const recentSessions = summary.recentSessions || [];
  const topArticles = summary.topContent?.articles || [];
  const topGames = summary.topContent?.games || [];
  const dailyTrend = summary.dailyTrend || [];
  const articleDailyTrend = summary.articleDailyTrend || [];
  const deviceBreakdown = summary.deviceBreakdown || [];
  const browserBreakdown = summary.browserBreakdown || [];

  const trendChartData = useMemo(
    () => ({
      labels: dailyTrend.length ? dailyTrend.map((item) => item._id) : ["بدون داده"],
      datasets: [
        {
          label: "بازدید",
          data: dailyTrend.length ? dailyTrend.map((item) => item.pageViews || 0) : [0],
          backgroundColor: "#38bdf8",
          borderRadius: 8,
          maxBarThickness: 48,
        },
      ],
    }),
    [dailyTrend]
  );

  const deviceChartData = useMemo(() => {
    const items = deviceBreakdown.length ? deviceBreakdown : [{ _id: "بدون داده", count: 0 }];
    return {
      labels: items.map((item) => item._id || "نامشخص"),
      datasets: [
        {
          label: "نشست",
          data: items.map((item) => item.count || 0),
          backgroundColor: chartPalette,
          borderColor: "#09090b",
          borderWidth: 3,
        },
      ],
    };
  }, [deviceBreakdown]);

  const browserChartData = useMemo(() => {
    const items = browserBreakdown.length ? browserBreakdown : [{ _id: "بدون داده", count: 0 }];
    return {
      labels: items.map((item) => item._id || "نامشخص"),
      datasets: [
        {
          label: "نشست",
          data: items.map((item) => item.count || 0),
          backgroundColor: chartPalette,
          borderColor: "#09090b",
          borderWidth: 3,
        },
      ],
    };
  }, [browserBreakdown]);

  const articleViewsChartData = useMemo(
    () => ({
      labels: articleDailyTrend.length ? articleDailyTrend.map((item) => item._id) : ["بدون داده"],
      datasets: [
        {
          label: "بازدید مجله",
          data: articleDailyTrend.length ? articleDailyTrend.map((item) => item.pageViews || 0) : [0],
          backgroundColor: "#f97316",
          borderRadius: 8,
          maxBarThickness: 48,
        },
      ],
    }),
    [articleDailyTrend]
  );

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">رفتار کاربران و محتوای سایت</p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">داشبورد آمار بازدید</h1>
            </div>
          
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="بازدید امروز" value={totals.pageViewsToday} unit="page view" accent="from-sky-950 to-zinc-950" />
          <StatCard title="نشست امروز" value={totals.sessionsToday} unit="session" accent="from-emerald-950 to-zinc-950" />
          <StatCard title="کاربر فعال" value={totals.activeSessions} unit="۵ دقیقه اخیر" accent="from-rose-950 to-zinc-950" />
          <StatCard title="میانگین حضور" value={Math.round((totals.averageDurationMs || 0) / 1000)} unit={formatDuration(totals.averageDurationMs)} />
        </div>

        <RecentSessionsTable recentSessions={recentSessions} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <AnalyticsChart title="روند بازدید ۷ روز اخیر" type="bar" data={trendChartData} />
          <AnalyticsChart title="نوع دستگاه کاربران" type="doughnut" data={deviceChartData} />
          <AnalyticsChart title="مرورگر کاربران" type="doughnut" data={browserChartData} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="کل بازدیدها" value={totals.totalPageViews} unit="ثبت شده" />
          <StatCard title="بازدید مجله" value={totals.articlePageViews} unit="article page view" accent="from-orange-950 to-zinc-950" />
          <StatCard title="بازدیدکننده یکتا" value={totals.totalVisitors} unit="visitor" />
          <StatCard title="لایک‌ها" value={totals.totalLikes} unit="article / game" />
        </div>

        <AnalyticsChart title="آمار بازدید صفحات مجله" type="bar" data={articleViewsChartData} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ContentTable title="مجله‌های پربازدید" rows={topArticles} type="article" />
          <ContentTable title="بازی‌های پربازدید" rows={topGames} type="game" />
        </div>

      </section>
    </ControlPanel>
  );
}

export default Dashboard;

