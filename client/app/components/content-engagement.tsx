"use client";

import { Heart, MessageCircle, Share2, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/api";
import { getAnalyticsIds } from "./analytics-tracker";

type Props = {
  entityType: "article" | "game";
  entityId: string;
  views?: number;
  likes?: number;
  commentsCount?: number;
  shares?: number;
};

function formatCount(value = 0) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function ContentEngagement({
  entityType,
  entityId,
  views = 0,
  likes = 0,
  commentsCount = 0,
  shares = 0,
}: Props) {
  const likeKey = `bazisara_like_${entityType}_${entityId}`;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const metrics = useMemo(
    () => [
      { label: "بازدید", value: views, icon: Eye },
      { label: "نظر", value: commentsCount, icon: MessageCircle },
      { label: "اشتراک", value: shares, icon: Share2 },
    ],
    [commentsCount, shares, views]
  );

  useEffect(() => {
    setLiked(localStorage.getItem(likeKey) === "1");
  }, [likeKey]);

  const sendEvent = async (eventType: "like" | "share") => {
    const ids = getAnalyticsIds();
    await fetch(`${API_BASE}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...ids,
        eventType,
        entityType,
        entityId,
        path: window.location.pathname,
        referrer: document.referrer,
      }),
    }).catch(() => undefined);
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount((value) => value + 1);
    localStorage.setItem(likeKey, "1");
    await sendEvent("like");
  };

  const handleShare = async () => {
    await sendEvent("share");
    if (navigator.share) {
      await navigator.share({ title: document.title, url: window.location.href }).catch(() => undefined);
    } else {
      await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-600">
      <button
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 transition ${
          liked
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-zinc-200 bg-white hover:border-red-300 hover:text-red-600"
        }`}
        type="button"
        onClick={handleLike}
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        <span>{formatCount(likeCount)}</span>
      </button>

      {metrics.map((item) => (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-2"
          key={item.label}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
          <span>{formatCount(item.value)}</span>
        </span>
      ))}

      <button
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-2 transition hover:border-zinc-400"
        type="button"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        <span>اشتراک</span>
      </button>
    </div>
  );
}
