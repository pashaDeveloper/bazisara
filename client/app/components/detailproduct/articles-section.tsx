import type { ProductDetail } from "../../products2/detail-data";
import { ArticleCard } from "./article-card";

export function ArticlesSection({ articles }: Pick<ProductDetail, "articles">) {
  return (
    <>
      <section className="mt-10 hidden rounded-[1.8rem] bg-[#f7f9fc] p-6 lg:block">
        <div className="grid grid-cols-4 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[1.5rem] bg-[#f7f9fc] p-4 lg:hidden">
        <h2 className="text-[2rem] font-black text-[#29467c]">محصولات مرتبط</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {articles.map((article) => (
            <div key={article.id} className="w-[320px] shrink-0">
              <ArticleCard {...article} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
