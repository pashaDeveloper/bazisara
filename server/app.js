const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const error = require("./middleware/error.middleware");

const app = express();
app.set("trust proxy", true);

/* allowed origins */
const allowedOrigins = [
  process.env.NEXT_PUBLIC_CLIENT_URL,
  process.env.NEXT_PUBLIC_DASHBOARD_URL
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-lang"],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    }
  })
);

app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));












app.use("/api/admin", require("./routes/admin.route"));
app.use("/api/icons", require("./routes/icon.route"));
app.use("/api/categories", require("./routes/category.route"));
app.use("/api/filter-definitions", require("./routes/filterDefinition.route"));
app.use("/api/category-filters", require("./routes/categoryFilter.route"));
app.use("/api/genres", require("./routes/genre.route"));
app.use("/api/platforms", require("./routes/platform.route"));
app.use("/api/companies", require("./routes/company.route"));
app.use("/api/tags", require("./routes/tag.route"));
app.use("/api/games", require("./routes/game.route"));
app.use("/api/articles", require("./routes/article.route"));
app.use("/api/analytics", require("./routes/analytics.route"));
app.use("/api/sliders", require("./routes/slider.route"));
app.use("/api/uploads", require("./routes/upload.route"));



app.use(error);

module.exports = app;
