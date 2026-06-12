import { Heart, MessageCircle } from "lucide-react";
import type { DetailComment } from "../../products2/detail-data";

export function CommentCard({ author, handle, body, timeAgo, likes, replies, tone }: DetailComment) {
  return (
    <article className="border-b border-[#edf1f6] py-8 last:border-b-0">
      <div className="flex flex-col items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
          style={{ backgroundColor: tone }}
        >
          {author.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-[#79839a]">
            <span>{timeAgo}</span>
            <span>•</span>
            <span className="font-medium">{handle}</span>
          </div>
          <div className="mt-2 text-[1.08rem] font-black text-[#243866]">{author}</div>
          <p className="mt-4 text-[1.06rem] leading-9 text-[#2f3d62]">{body}</p>
          <div className="mt-4 flex items-center gap-5 text-sm text-[#7a8395]">
            <button type="button" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {likes.toLocaleString("fa-IR")}
            </button>
            <button type="button" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {replies.toLocaleString("fa-IR")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
