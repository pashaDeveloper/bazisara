const mongoose = require("mongoose");
const AnalyticsSession = require("../models/analyticsSession.model");
const Article = require("../models/article.model");
const Game = require("../models/game.model");

const CONTENT_MODELS = {
  article: { model: Article, modelName: "Article" },
  game: { model: Game, modelName: "Game" },
};

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function getIp(req) {
  const forwarded = clean(req.headers["x-forwarded-for"]).split(",")[0].trim();
  return forwarded || req.ip || req.socket?.remoteAddress || "";
}

function parseClient(userAgent = "") {
  const ua = String(userAgent);
  const isBot = /bot|crawler|spider|crawling/i.test(ua);
  const isTablet = /tablet|ipad/i.test(ua);
  const isMobile = !isTablet && /mobi|android|iphone|ipod/i.test(ua);

  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";
  else if (/mac os|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return {
    browser,
    os,
    deviceType: isBot ? "bot" : isTablet ? "tablet" : isMobile ? "mobile" : "desktop",
  };
}

function getEntityInfo(entityType, entityId) {
  const type = clean(entityType, 20);
  if (!CONTENT_MODELS[type] || !mongoose.Types.ObjectId.isValid(entityId)) {
    return { entityType: "", entityId: null, entityModel: null };
  }

  return {
    entityType: type,
    entityId,
    entityModel: CONTENT_MODELS[type].modelName,
  };
}

async function incrementContentMetric(entityType, entityId, metric) {
  const target = CONTENT_MODELS[entityType];
  if (!target || !mongoose.Types.ObjectId.isValid(entityId)) return;

  await target.model.updateOne(
    { _id: entityId, isDeleted: false },
    { $inc: { [metric]: 1 } }
  );
}

async function upsertSession(req, payload) {
  const sessionId = clean(payload.sessionId, 120);
  const visitorId = clean(payload.visitorId, 120);

  if (!sessionId || !visitorId) {
    const error = new Error("sessionId and visitorId are required");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const ua = clean(req.headers["user-agent"], 1000);
  const client = parseClient(ua);
  const path = clean(payload.path || payload.landingPage, 500);

  return AnalyticsSession.findOneAndUpdate(
    { sessionId },
    {
      $setOnInsert: {
        sessionId,
        visitorId,
        ip: getIp(req),
        userAgent: ua,
        browser: client.browser,
        os: client.os,
        deviceType: client.deviceType,
        referrer: clean(payload.referrer, 500),
        landingPage: path,
        startedAt: now,
      },
      $set: {
        currentPath: path,
        lastSeenAt: now,
      },
    },
    { new: true, upsert: true }
  );
}

exports.trackPageView = async (req, res) => {
  const payload = req.body || {};
  const now = new Date();
  const session = await upsertSession(req, payload);
  const entity = getEntityInfo(payload.entityType, payload.entityId);
  const path = clean(payload.path, 500);
  const durationMs = Math.max(0, Number(payload.durationMs || 0));

  session.currentPath = path || session.currentPath;
  session.lastSeenAt = now;
  session.durationMs = Math.max(session.durationMs || 0, Number(payload.totalDurationMs || 0));
  session.pageViews.push({
    path,
    title: clean(payload.title, 200),
    referrer: clean(payload.referrer, 500),
    ...entity,
    startedAt: payload.startedAt ? new Date(payload.startedAt) : now,
    lastSeenAt: now,
    durationMs,
  });
  session.events.views += 1;
  await session.save();

  if (entity.entityType && entity.entityId) {
    await incrementContentMetric(entity.entityType, entity.entityId, "views");
  }

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    data: { sessionId: session.sessionId },
  });
};

exports.updateHeartbeat = async (req, res) => {
  const payload = req.body || {};
  const sessionId = clean(payload.sessionId, 120);

  if (!sessionId) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "sessionId is required",
    });
  }

  const session = await AnalyticsSession.findOne({ sessionId });
  if (!session) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Session not found",
    });
  }

  const now = new Date();
  const durationMs = Math.max(0, Number(payload.durationMs || 0));
  const totalDurationMs = Math.max(0, Number(payload.totalDurationMs || 0));
  const path = clean(payload.path, 500);
  const page = [...session.pageViews].reverse().find((item) => item.path === path);

  session.lastSeenAt = now;
  session.currentPath = path || session.currentPath;
  session.durationMs = Math.max(session.durationMs || 0, totalDurationMs);
  if (page) {
    page.lastSeenAt = now;
    page.durationMs = Math.max(page.durationMs || 0, durationMs);
  }
  await session.save();

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
  });
};

exports.trackEvent = async (req, res) => {
  const payload = req.body || {};
  const session = await upsertSession(req, payload);
  const eventType = clean(payload.eventType, 20);
  const metric =
    eventType === "like"
      ? "likes"
      : eventType === "comment"
        ? "comments"
        : eventType === "share"
          ? "shares"
          : "";

  if (!metric) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "Unsupported eventType",
    });
  }

  session.events[metric] += 1;
  session.lastSeenAt = new Date();
  await session.save();

  const entity = getEntityInfo(payload.entityType, payload.entityId);
  if (entity.entityType && entity.entityId) {
    const field = metric === "comments" ? "commentsCount" : metric;
    await incrementContentMetric(entity.entityType, entity.entityId, field);
  }

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
  });
};

exports.getSummary = async (_req, res) => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalSessions,
    activeSessions,
    totalVisitors,
    sessionsToday,
    pageViewsToday,
    totalPageViews,
    totalLikes,
    totalComments,
    articleCount,
    gameCount,
    topArticles,
    topGames,
    recentSessions,
    deviceBreakdown,
    browserBreakdown,
    dailyTrend,
  ] = await Promise.all([
    AnalyticsSession.countDocuments(),
    AnalyticsSession.countDocuments({ lastSeenAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) } }),
    AnalyticsSession.distinct("visitorId").then((items) => items.length),
    AnalyticsSession.countDocuments({ startedAt: { $gte: dayAgo } }),
    AnalyticsSession.aggregate([
      { $match: { "pageViews.startedAt": { $gte: dayAgo } } },
      { $unwind: "$pageViews" },
      { $match: { "pageViews.startedAt": { $gte: dayAgo } } },
      { $count: "count" },
    ]).then((items) => items[0]?.count || 0),
    AnalyticsSession.aggregate([{ $group: { _id: null, total: { $sum: "$events.views" } } }]).then((items) => items[0]?.total || 0),
    AnalyticsSession.aggregate([{ $group: { _id: null, total: { $sum: "$events.likes" } } }]).then((items) => items[0]?.total || 0),
    AnalyticsSession.aggregate([{ $group: { _id: null, total: { $sum: "$events.comments" } } }]).then((items) => items[0]?.total || 0),
    Article.countDocuments({ isDeleted: false }),
    Game.countDocuments({ isDeleted: false }),
    Article.find({ isDeleted: false }).sort({ views: -1, likes: -1 }).limit(5).select("title slug views likes commentsCount"),
    Game.find({ isDeleted: false }).sort({ views: -1, likes: -1 }).limit(5).select("title slug views likes commentsCount"),
    AnalyticsSession.find().sort({ lastSeenAt: -1 }).limit(10).select("visitorId ip browser os deviceType referrer landingPage currentPath durationMs startedAt lastSeenAt pageViews"),
    AnalyticsSession.aggregate([
      { $match: { startedAt: { $gte: weekAgo } } },
      { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsSession.aggregate([
      { $match: { startedAt: { $gte: weekAgo } } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsSession.aggregate([
      { $unwind: "$pageViews" },
      { $match: { "pageViews.startedAt": { $gte: weekAgo } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$pageViews.startedAt",
              timezone: "Asia/Tehran",
            },
          },
          pageViews: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const averageDurationMs = totalSessions
    ? await AnalyticsSession.aggregate([{ $group: { _id: null, avg: { $avg: "$durationMs" } } }]).then((items) => Math.round(items[0]?.avg || 0))
    : 0;

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    data: {
      totals: {
        totalSessions,
        activeSessions,
        totalVisitors,
        sessionsToday,
        pageViewsToday,
        totalPageViews,
        totalLikes,
        totalComments,
        articleCount,
        gameCount,
        averageDurationMs,
      },
      topContent: {
        articles: topArticles,
        games: topGames,
      },
      recentSessions,
      deviceBreakdown,
      browserBreakdown,
      dailyTrend,
    },
  });
};
