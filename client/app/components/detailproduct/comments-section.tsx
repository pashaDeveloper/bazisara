import type { ProductDetail } from "../../products2/detail-data";
import { CommentCard } from "./comment-card";

export function CommentsSection({
  commentsTitle,
  comments,
}: Pick<ProductDetail, "commentsTitle" | "comments">) {
  return (
    <>
      <section className="mt-10 hidden lg:block">
        <div className="flex items-center justify-between px-2">
          <div className="text-[1.95rem] font-black text-[#2d3650]">{commentsTitle}</div>
          <div className="text-lg text-[#7b8397]">قوانین و مقررات را می‌پذیرم</div>
        </div>

        <div className="mt-4 rounded-[1.7rem] border border-[#e7ebf1] bg-white p-6">
          <div className="flex justify-end gap-8 border-b border-[#eef2f6] pb-4 text-xl font-bold text-[#7b8397]">
            <button className="text-[#ef476f]">دیدگاه</button>
            <button>سوال</button>
          </div>
          <div className="mt-5 rounded-[1.4rem] border border-[#edf1f6] px-5 py-4 text-[#9aa3b4]">
            متن را اینجا وارد کنید
          </div>
          <div className="mt-5 flex justify-end">
            <button className="rounded-full bg-[#2e3142] px-10 py-4 text-lg font-bold text-white">
              ارسال نظر
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[1.7rem] border border-[#e7ebf1] bg-white p-6">
          <div className="mb-6 flex items-center justify-between border-b border-[#eef2f6] pb-5">
            <div className="flex items-center gap-8 text-lg font-bold text-[#7b8397]">
              <button className="text-[#ef476f]">همه</button>
              <button>دیدگاه‌ها</button>
              <button>سوالات</button>
            </div>
            <button className="text-lg text-[#7b8397]">جدیدترین</button>
          </div>

          {comments.map((comment) => (
            <CommentCard key={comment.id} {...comment} />
          ))}

          <div className="mt-8 flex justify-center">
            <button className="rounded-full border border-[#e7ebf1] px-8 py-4 text-lg font-bold text-[#4b557a]">
              مشاهده نظرات بیشتر
            </button>
          </div>
        </div>
      </section>

      <section className="mt-10 text-center lg:hidden">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#eef2fb] text-5xl font-black text-[#dc143c]">
          &rdquo;
        </div>
        <h2 className="mt-5 text-[2rem] font-black text-[#2c3650]">{commentsTitle}</h2>
        <p className="mt-3 text-[1.15rem] text-[#4c5672]">برای درج نظر وارد شو یا ثبت‌نام کن</p>
        <button className="mt-5 rounded-full bg-[#2e3142] px-10 py-4 text-lg font-bold text-white">
          ورود / ثبت‌نام
        </button>
      </section>

      <div className="mt-8 flex gap-4 lg:hidden">
        <button className="flex-1 rounded-full border border-[#e7ebf1] px-6 py-3 text-lg font-bold text-[#4b557a]">
          فیلتر
        </button>
        <button className="flex-1 rounded-full border border-[#e7ebf1] px-6 py-3 text-lg font-bold text-[#4b557a]">
          مرتب‌سازی
        </button>
      </div>

      <section className="mt-4 lg:hidden">
        {comments.slice(0, 2).map((comment) => (
          <CommentCard key={comment.id} {...comment} />
        ))}
        <button className="mt-4 w-full rounded-full border border-[#eceff5] px-6 py-4 text-lg font-bold text-[#4b557a]">
          مشاهده نظرات بیشتر
        </button>
      </section>
    </>
  );
}
