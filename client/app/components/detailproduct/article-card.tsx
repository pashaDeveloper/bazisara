import Image from "next/image";
import type { DetailArticle } from "../../products2/detail-data";

export function ArticleCard({ title, excerpt, image, date }: DetailArticle) {
  return (
    <article className="rounded-[1.6rem] border border-[#e6ebf1] bg-white p-4 shadow-[0_24px_48px_-36px_rgba(15,23,42,.25)]">
      <div className="relative aspect-[1.28] overflow-hidden rounded-[1.2rem]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 20rem, 80vw"
          className="object-cover"
        />
      </div>
      <h3 className="mt-4 text-[1.8rem] font-bold leading-[1.9] text-[#273a70] lg:text-[1.35rem]">
        {title}
      </h3>
      <p className="mt-3 line-clamp-3 text-[1.2rem] leading-9 text-[#4b557a] lg:text-sm lg:leading-7">
        {excerpt}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          className="rounded-full bg-[#1780df] px-5 py-2 text-sm font-bold text-white"
        >
          اطلاعات بیشتر
        </button>
        <span className="text-sm text-[#707b93]">{date}</span>
      </div>
    </article>
  );
}
