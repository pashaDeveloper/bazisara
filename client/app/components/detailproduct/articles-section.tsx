import type { ProductDetail } from "../../products2/detail-data";
import { ArticleCard } from "./article-card";

function ArticleSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] animate-pulse rounded-[1.25rem] bg-zinc-200" />
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-zinc-200" />
      <div className="h-3 w-full animate-pulse rounded-full bg-zinc-200" />
    </div>
  );
}

export function ArticlesSection({ articles }: Pick<ProductDetail, "articles">) {
  const hasArticles = articles.length > 0;

  return (
    <>
      <section className="mt-10 hidden rounded-[1.8rem] bg-[#f7f9fc] p-6 lg:block">
        <div className="grid grid-cols-4 gap-5">
          {hasArticles
            ? articles.map((article) => <ArticleCard key={article.id} {...article} />)
            : Array.from({ length: 4 }, (_, index) => <ArticleSkeleton key={index} />)}
        </div>
      </section>

      <section className="mt-10 rounded-[1.5rem] bg-[#f7f9fc] p-4 lg:hidden">
        <h2 className="text-[2rem] font-black text-[#29467c]">محصولات مرتبط</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {hasArticles
            ? articles.map((article) => (
                <div key={article.id} className="w-[320px] shrink-0">
                  <ArticleCard {...article} />
                </div>
              ))
            : Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="w-[320px] shrink-0">
                  <ArticleSkeleton />
                </div>
              ))}
        </div>
      </section>
    </>
  );
}
