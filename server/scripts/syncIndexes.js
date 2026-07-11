const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.DB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/bazisara";

const modelsDir = path.join(__dirname, "..", "models");

fs.readdirSync(modelsDir)
  .filter((file) => file.endsWith(".model.js") && file !== "baseSchema.model.js")
  .forEach((file) => {
    require(path.join(modelsDir, file));
  });

async function main() {
  await mongoose.connect(mongoUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});

  for (const modelName of mongoose.modelNames()) {
    const Model = mongoose.model(modelName);
    const result = await Model.syncIndexes();
    console.log(`[sync-indexes] ${modelName}`, result);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("[sync-indexes] failed", error);
  await mongoose.disconnect();
  process.exit(1);
});
