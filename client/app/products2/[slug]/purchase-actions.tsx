"use client";

import { CheckCircle2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "../data";

type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

const CART_STORAGE_KEY = "bazibazaar-cart";

function upsertCartItem(item: CartItem) {
  if (typeof window === "undefined") return;

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  const cart: CartItem[] = raw ? JSON.parse(raw) : [];
  const existing = cart.find((entry) => entry.id === item.id);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("bazibazaar:cart-updated", { detail: cart }));
}

export function DesktopPurchaseCard({
  productId,
  title,
  price,
  image,
  priceLabel,
}: {
  productId: number;
  title: string;
  price: number;
  image: string;
  priceLabel: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");

  const increase = () => setQuantity((value) => value + 1);
  const decrease = () => setQuantity((value) => Math.max(1, value - 1));

  const handleAddToCart = () => {
    upsertCartItem({ id: productId, title, price, image, quantity });
    setAddedMessage(`${quantity.toLocaleString("fa-IR")} عدد به سبد خرید اضافه شد`);
    window.setTimeout(() => setAddedMessage(""), 2600);
  };

  return (
    <div className="rounded-[1.5rem] border border-[#e7ebf1] bg-white p-6 shadow-[0_25px_50px_-38px_rgba(15,23,42,.22)]">
      <div className="mb-5 rounded-[1rem] bg-[#f7f8fb] px-5 py-4 text-center text-[1.05rem] font-bold text-[#3a6bc0]">
        همکار هستید؟ دریافت پنل همکاری
      </div>
      <div className="flex items-center justify-between text-[1rem] font-bold text-[#2f3c61]">
        <span>{priceLabel}</span>
        <span className="text-[1.8rem] font-black text-[#29467c]">
          {formatPrice(price)} <span className="text-sm font-medium">تومان</span>
        </span>
      </div>
      <div className="mt-6 rounded-[1.1rem] border border-[#edf1f6] p-4">
        <div className="flex items-center justify-between text-base font-bold text-[#2d3c61]">
          <span>تعداد</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={increase}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e7ebf1]"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="flex h-11 min-w-[4.5rem] items-center justify-center rounded-[1rem] bg-[#fafbfe]">
              {quantity.toLocaleString("fa-IR")}
            </div>
            <button
              type="button"
              onClick={decrease}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e7ebf1]"
            >
              <Minus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#f43f5e] px-6 py-4 text-lg font-black text-white shadow-[0_22px_36px_-24px_rgba(244,63,94,.78)]"
      >
        <ShoppingCart className="h-5 w-5" />
        افزودن به سبدخرید
      </button>
      {addedMessage ? (
        <div className="mt-3 flex items-center gap-2 text-sm font-bold text-[#15803d]">
          <CheckCircle2 className="h-4 w-4" />
          {addedMessage}
        </div>
      ) : null}
    </div>
  );
}

export function MobilePurchaseBar({
  productId,
  title,
  price,
  image,
}: {
  productId: number;
  title: string;
  price: number;
  image: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");

  const handleAddToCart = () => {
    upsertCartItem({ id: productId, title, price, image, quantity });
    setAddedMessage("به سبد خرید اضافه شد");
    window.setTimeout(() => setAddedMessage(""), 2200);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8ecf3] bg-white px-4 py-4 shadow-[0_-20px_40px_-34px_rgba(15,23,42,.32)] lg:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e7ebf1]"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex min-w-[3rem] shrink-0 items-center justify-center text-base font-black text-[#111827]">
          {quantity.toLocaleString("fa-IR")}
        </div>
        <button
          type="button"
          onClick={() => setQuantity((value) => value + 1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e7ebf1]"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[1.05rem] text-[#111827]">تومان</div>
          <div className="text-[1.7rem] font-black text-[#111827]">{formatPrice(price)}</div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-[1rem] bg-[#f43f5e] px-6 py-4 text-[1rem] font-black text-white"
        >
          افزودن به سبد خرید
        </button>
      </div>
      {addedMessage ? (
        <div className="mt-2 text-sm font-bold text-[#15803d]">{addedMessage}</div>
      ) : null}
    </div>
  );
}
