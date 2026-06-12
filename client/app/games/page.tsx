import { CatalogBrowser } from "../components/catalog-browser";
import type { Game } from "../lib/api";
import { getApiList } from "../lib/api";

export const metadata = {
  title: "بازی‌ها | بازی سرا",
};

export default async function GamesPage() {
  const games = await getApiList<Game>("/games/all", 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-950">
      <CatalogBrowser
        items={games}
        kind="game"
        label="فروشگاه بازی"
        subtitle="بازی‌ها را می‌توانی بر اساس دسته‌بندی، جستجو و کارت‌های ویژه فیلتر کنی."
        title="همه بازی‌های ثبت شده در داشبورد"
      />
    </div>
  );
}
