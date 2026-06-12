import type { ProductDetail } from "../../products2/detail-data";
import { DesktopPurchaseCard } from "../../products2/[id]/purchase-actions";
import { REACTIONS, REACTION_LABELS } from "./constants";

export function PurchaseSidebar({
  productId,
  title,
  priceLabel,
  price,
  image,
  reactionScore,
  selectedReaction,
}: {
  productId: number;
  title: string;
  priceLabel: string;
  price: number;
  image: string;
  reactionScore: string;
  selectedReaction: ProductDetail["selectedReaction"];
}) {
  return (
    <aside dir="rtl" className="space-y-5">
      <DesktopPurchaseCard
        productId={productId}
        title={title}
        priceLabel={priceLabel}
        price={price}
        image={image}
      />

      <div className="rounded-[1.5rem] border border-[#e7ebf1] bg-white p-6 shadow-[0_25px_50px_-38px_rgba(15,23,42,.18)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[1.35rem] font-bold text-[#31467c]">امتیاز شما :</h3>
          <span className="text-[1.6rem] font-black text-[#31467c]">{reactionScore}</span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-sm text-[#727d92]">
          {REACTIONS.map((item) => (
            <div
              key={item}
              className={`rounded-[1rem] px-2 py-4 ${
                item === selectedReaction ? "bg-[#e7f7ec] text-[#1f8d4d]" : "bg-[#fbfcff]"
              }`}
            >
              <div className="text-2xl">
                {item === "Love"
                  ? "😍"
                  : item === "Like"
                    ? "🙂"
                    : item === "Neutral"
                      ? "😐"
                      : item === "Dislike"
                        ? "🙁"
                        : "😖"}
              </div>
              <div className="mt-2">{REACTION_LABELS[item]}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
