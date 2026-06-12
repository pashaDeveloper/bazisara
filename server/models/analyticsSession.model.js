const mongoose = require("mongoose");

const pageViewSchema = new mongoose.Schema(
  {
    path: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    referrer: { type: String, trim: true, default: "" },
    entityType: {
      type: String,
      enum: ["", "article", "game"],
      default: "",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "pageViews.entityModel",
      default: null,
    },
    entityModel: {
      type: String,
      enum: ["Article", "Game", null],
      default: null,
    },
    startedAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    durationMs: { type: Number, default: 0 },
  },
  { _id: false }
);

const analyticsSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorId: { type: String, required: true, index: true },
    ip: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, default: "" },
    browser: { type: String, trim: true, default: "Unknown" },
    os: { type: String, trim: true, default: "Unknown" },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "bot", "unknown"],
      default: "unknown",
    },
    referrer: { type: String, trim: true, default: "" },
    landingPage: { type: String, trim: true, default: "" },
    currentPath: { type: String, trim: true, default: "" },
    startedAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    durationMs: { type: Number, default: 0 },
    pageViews: [pageViewSchema],
    events: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

analyticsSessionSchema.index({ lastSeenAt: -1 });
analyticsSessionSchema.index({ "pageViews.entityType": 1, "pageViews.entityId": 1 });

const AnalyticsSession = mongoose.model("AnalyticsSession", analyticsSessionSchema);

module.exports = AnalyticsSession;
