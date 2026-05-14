import React from "react";
import { Link } from "react-router-dom";
import ControlPanel from "./ControlPanel";

const kpis = [
  { title: "فروش امروز", value: "1,284,000,000", unit: "تومان", trend: "+12%" },
  { title: "سفارش در انتظار", value: "186", unit: "سفارش", trend: "+8%" },
  { title: "نرخ تبدیل", value: "4.92", unit: "%", trend: "+0.7%" },
  { title: "بازدید فعال", value: "3,421", unit: "کاربر", trend: "-2%" },
];

const traffic = [
  { channel: "جستجوی ارگانیک", value: 44 },
  { channel: "تبلیغات", value: 29 },
  { channel: "شبکه اجتماعی", value: 19 },
  { channel: "مستقیم", value: 8 },
];

const latestOrders = [
  { id: "#8452", customer: "مریم کریمی", amount: "12,450,000", status: "ارسال شد" },
  { id: "#8451", customer: "علی اسدی", amount: "2,800,000", status: "در حال آماده سازی" },
  { id: "#8450", customer: "نازنین احمدی", amount: "8,100,000", status: "در انتظار پرداخت" },
  { id: "#8449", customer: "مجتبی اکبری", amount: "4,750,000", status: "لغو شد" },
];

const tasks = [
  { label: "بهینه سازی صفحه محصول", done: true },
  { label: "تست مسیر پرداخت مهمان", done: false },
  { label: "بررسی نرخ بازگشت سفارش", done: true },
  { label: "آماده سازی کمپین نوروز", done: false },
];

const activity = [
  "پرداخت سفارش #8452 تایید شد.",
  "موجودی محصول «کتونی مشکی» به 7 رسید.",
  "کاربر جدید با پلن فروشنده ثبت نام کرد.",
  "گزارش فروش هفتگی تولید شد.",
];

function trendColor(value) {
  return value.startsWith("-")
    ? "text-zinc-400 border-zinc-700"
    : "text-white border-zinc-500";
}

function statusStyle(status) {
  if (status === "ارسال شد") return "bg-white text-black";
  if (status === "لغو شد") return "bg-zinc-800 text-zinc-300";
  if (status === "در انتظار پرداخت") return "bg-zinc-700 text-zinc-100";
  return "bg-zinc-600 text-white";
}

function Dashboard() {
  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">پنل مدیریت فروشگاه</p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">داشبورد پیشرفته</h1>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <button className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 transition hover:border-white hover:text-white">
                فیلتر 7 روز
              </button>
              <button className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 transition hover:border-white hover:text-white">
                خروجی گزارش
              </button>
              <button className="col-span-2 rounded-lg border border-white bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-zinc-200 sm:col-span-1">
                ثبت اعلان جدید
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <article key={item.title} className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
              <p className="text-xs text-zinc-400">{item.title}</p>
              <p className="mt-4 text-2xl font-bold text-white">{item.value}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">{item.unit}</span>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${trendColor(item.trend)}`}
                >
                  {item.trend}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Link
            to="/categories"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 transition hover:border-white"
          >
            <p className="text-xs text-zinc-400">مدیریت ساختار</p>
            <h2 className="mt-2 text-lg font-bold text-white">دسته‌بندی‌ها</h2>
            <p className="mt-2 text-sm text-zinc-500">
              دسته‌بندی‌های چندسطحی با تصویر فایل و آیکون متنی را از اینجا بساز و مدیریت کن.
            </p>
          </Link>
          <Link
            to="/genres"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 transition hover:border-white"
          >
            <p className="text-xs text-zinc-400">مدیریت ویژگی</p>
            <h2 className="mt-2 text-lg font-bold text-white">ژانرها</h2>
            <p className="mt-2 text-sm text-zinc-500">
              ژانرهای مستقل بازی را با تصویر و آیکون ثبت کن تا بعدا موقع افزودن بازی انتخاب شوند.
            </p>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4 xl:col-span-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">روند فروش هفتگی</h2>
              <span className="text-xs text-zinc-400">آخرین بروزرسانی: 5 دقیقه پیش</span>
            </div>
            <div className="flex h-40 items-end gap-2 rounded-xl border border-zinc-800 bg-black p-3 sm:h-52">
              {[38, 22, 45, 30, 54, 41, 60].map((h, index) => (
                <div key={index} className="flex flex-1 flex-col justify-end">
                  <div className="w-full rounded-md bg-white/90" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 text-center text-[10px] text-zinc-500 sm:text-xs">
              {["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنج شنبه", "جمعه"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4 xl:col-span-4">
            <h2 className="text-sm font-bold text-white">منابع ترافیک</h2>
            <div className="mt-4 space-y-3">
              {traffic.map((item) => (
                <div key={item.channel}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-zinc-300">{item.channel}</span>
                    <span className="text-zinc-500">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800">
                    <div className="h-2 rounded-full bg-white" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4 xl:col-span-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">آخرین سفارش ها</h2>
              <button className="text-xs text-zinc-400 transition hover:text-white">مشاهده همه</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-right text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="pb-3 font-medium">کد سفارش</th>
                    <th className="pb-3 font-medium">مشتری</th>
                    <th className="pb-3 font-medium">مبلغ</th>
                    <th className="pb-3 font-medium">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrders.map((order) => (
                    <tr key={order.id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-3">{order.id}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3">{order.amount}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-1 text-[11px] ${statusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid grid-cols-1 gap-4 xl:col-span-4">
            <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
              <h2 className="text-sm font-bold text-white">تسک های تیم</h2>
              <ul className="mt-3 space-y-2">
                {tasks.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black px-3 py-2 text-xs sm:text-sm"
                  >
                    <span className={item.done ? "text-zinc-300" : "text-white"}>{item.label}</span>
                    <span className="text-zinc-500">{item.done ? "انجام شد" : "باز"}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
              <h2 className="text-sm font-bold text-white">فعالیت لحظه ای</h2>
              <ul className="mt-3 space-y-2">
                {activity.map((item) => (
                  <li key={item} className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-300 sm:text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>
    </ControlPanel>
  );
}

export default Dashboard;
