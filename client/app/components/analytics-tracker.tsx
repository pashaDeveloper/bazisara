"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { API_BASE } from "../lib/api";

const VISITOR_KEY = "bazisara_visitor_id";
const SESSION_KEY = "bazisara_session_id";

function makeId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}

export function getAnalyticsIds() {
  if (typeof window === "undefined") {
    return { visitorId: "", sessionId: "" };
  }

  let visitorId = localStorage.getItem(VISITOR_KEY);
  if (!visitorId) {
    visitorId = makeId("visitor");
    localStorage.setItem(VISITOR_KEY, visitorId);
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = makeId("session");
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return { visitorId, sessionId };
}

function contentFromPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  const entityType = parts[0] === "articles" ? "article" : parts[0] === "games" ? "game" : "";
  const entityId = entityType && parts.length >= 3 ? parts[2] : "";

  return { entityType, entityId };
}

function send(path: string, body: Record<string, unknown>, method = "POST") {
  return fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    keepalive: true,
    body: JSON.stringify(body),
  }).catch(() => undefined);
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const pageStartedAt = useRef(Date.now());
  const sessionStartedAt = useRef(Date.now());
  const previousPath = useRef("");

  useEffect(() => {
    if (!pathname) return;

    const { visitorId, sessionId } = getAnalyticsIds();
    const now = Date.now();
    const previousDuration = previousPath.current ? now - pageStartedAt.current : 0;

    if (previousPath.current) {
      send(
        "/analytics/heartbeat",
        {
          visitorId,
          sessionId,
          path: previousPath.current,
          durationMs: previousDuration,
          totalDurationMs: now - sessionStartedAt.current,
        },
        "PATCH"
      );
    }

    pageStartedAt.current = now;
    previousPath.current = pathname;

    send("/analytics/pageview", {
      visitorId,
      sessionId,
      path: pathname,
      title: document.title,
      referrer: document.referrer,
      startedAt: new Date(now).toISOString(),
      totalDurationMs: now - sessionStartedAt.current,
      ...contentFromPath(pathname),
    });
  }, [pathname]);

  useEffect(() => {
    const flush = () => {
      const { visitorId, sessionId } = getAnalyticsIds();
      const now = Date.now();

      if (!previousPath.current) return;

      send(
        "/analytics/heartbeat",
        {
          visitorId,
          sessionId,
          path: previousPath.current,
          durationMs: now - pageStartedAt.current,
          totalDurationMs: now - sessionStartedAt.current,
        },
        "PATCH"
      );
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
