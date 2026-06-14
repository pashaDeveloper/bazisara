import { CatalogBrowser } from "../components/catalog-browser";
import type { Article } from "../lib/api";
import { getApiList } from "../lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "مجله | بازی بازار",
};

export default async function ArticlesPage() {
  const articles = await getApiList<Article>("/articles/all", 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-950">
      <CatalogBrowser
        items={articles}
        kind="article"
        label="مجله بازی بازار"
        subtitle="مجله‌ها بر اساس دسته‌بندی، جستجو و مجله‌های ویژه فیلتر می‌شوند."
        title="آخرین نوشته‌های مجله"
      />
    </div>
  );
}
