import { Grid2x2, HomeIcon, ShoppingBasket, UserRound } from "lucide-react";
import Link from "next/link";
import { HomeHeroSlider } from "./components/home-hero-slider";
import { HomeProductStrip } from "./components/home-product-strip";
import { HomeCollections } from "./components/home-collections";
import type { Article, Game, Slider } from "./lib/api";
import { getApiList } from "./lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const categoryTiles = [
  { title: "دسته پلی استیشن", position: "0% 0%" },
  { title: "دسته ایکس باکس", position: "50% 0%" },
  { title: "جوی کان", position: "100% 0%" },
  { title: "هدست گیمینگ", position: "0% 33.333%" },
  { title: "پایه شارژ دسته", position: "50% 33.333%" },
  { title: "هدست واقعیت مجازی", position: "100% 33.333%" },
  { title: "ریموت کنترل", position: "0% 66.666%" },
  { title: "نگهدارنده موبایل", position: "50% 66.666%" },
  { title: "قاب بازی", position: "100% 66.666%" },
  { title: "کابل HDMI", position: "0% 100%" },
  { title: "استند کنسول", position: "50% 100%" },
  { title: "کاور دسته", position: "100% 100%" },
];

const bottomNavItems = [
  { href: "/", label: "صفحه نخست", icon: HomeIcon },
  { href: "/products2", label: "دسته‌بندی‌ها", icon: Grid2x2 },
  { href: "/cart", label: "سبد خرید", icon: ShoppingBasket },
  { href: "/account", label: "ناحیه کاربری", icon: UserRound },
];

const digitalServiceTiles = [
  { title: "گیم پس", subtitle: "اشتراک Xbox Game Pass", position: "0% 0%" },
  { title: "پلی استیشن پلاس", subtitle: "اشتراک Plus", position: "33.333% 0%" },
  { title: "گیفت کارت و اعتبار", subtitle: "کیف پول و شارژ اکانت", position: "66.666% 0%" },
  { title: "کد دیجیتال بازی", subtitle: "Redeem Code", position: "100% 0%" },
];

function CategoryRow() {
  return (
    <section className="mx-4 mt-9 md:mx-6">
      <h2 className="mb-4 text-right text-[1.35rem] font-black text-[#25335f] md:text-2xl">
        لوازم جانبی کنسول
      </h2>
      <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#dfe5ef] bg-white md:grid-cols-6">
        {categoryTiles.map((item, index) => (
          <Link
            href="/products2"
            className="flex min-h-[166px] flex-col items-center justify-center border-b border-l border-[#dfe5ef] px-2 py-4 text-center [&:nth-child(3n)]:border-l-0 [&:nth-child(n+10)]:border-b-0 md:min-h-[176px] md:[&:nth-child(3n)]:border-l md:[&:nth-child(6n)]:border-l-0 md:[&:nth-child(n+7)]:border-b-0"
            key={`${item.title}-${index}`}
          >
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-[2px] bg-white shadow-[0_6px_18px_-14px_rgba(15,23,42,.35)] ring-1 ring-[#edf1f6]">
              <div
                aria-hidden="true"
                className="h-[88px] w-[88px] bg-[url('/categories/console-accessories-sheet.png')] bg-[length:300%_400%] bg-no-repeat"
                style={{ backgroundPosition: item.position }}
              />
            </div>
            <p className="mt-3 text-[13px] font-medium leading-6 text-[#4c5668]">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DigitalServicesRow() {
  return (
    <section className="mx-4 mt-8 md:mx-6">
      <h2 className="mb-4 text-right text-[1.35rem] font-black text-[#25335f] md:text-2xl">
        اشتراک و گیفت کارت بازی
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="rtl">
        {digitalServiceTiles.map((item) => (
          <Link
            key={item.title}
            href="/products2"
            className="group relative h-[150px] w-[292px] shrink-0 overflow-hidden rounded-[1.15rem] bg-[#eef1f7] shadow-[0_16px_28px_-26px_rgba(15,23,42,.45)] md:h-[190px] md:w-[328px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[url('/categories/digital-gaming-services-sheet.png')] bg-[length:auto_100%] bg-no-repeat transition-transform duration-300 group-hover:scale-[1.03]"
              style={{ backgroundPosition: item.position }}
            />
            <div className="absolute right-0 top-0 rounded-bl-[1.1rem] bg-white px-4 py-2 shadow-[0_8px_18px_-16px_rgba(15,23,42,.45)]">
              <h3 className="text-[1rem] font-black text-[#242b3a] md:text-[1.2rem]">{item.title}</h3>
            </div>
            <span className="absolute bottom-3 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#25335f] backdrop-blur">
              {item.subtitle}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#e3e8f0] bg-white px-2 py-2 text-[11px] font-medium text-[#667085] shadow-[0_-10px_24px_-22px_rgba(15,23,42,.45)] lg:hidden">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
            <Icon className="h-5 w-5 stroke-[1.8]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default async function Home() {
  const [sliders, games, articles] = await Promise.all([
    getApiList<Slider>("/sliders/all", 8),
    getApiList<Game>("/games/all", 24),
    getApiList<Article>("/magazines/all", 24),
  ]);

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <HomeHeroSlider sliders={sliders} />
      <main className="mx-auto max-w-[1440px] pb-24 lg:pb-12">
        <HomeProductStrip />
        <CategoryRow />
        <DigitalServicesRow />
        <HomeCollections articles={articles} games={games} />
      </main>
      <MobileBottomNav />
    </div>
  );
}
