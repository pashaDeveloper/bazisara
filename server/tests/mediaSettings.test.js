const assert = require("node:assert/strict");
const { test } = require("node:test");
const sharp = require("sharp");
const { isBlurhashValid } = require("blurhash");
const { defaults, normalizeMediaSettings } = require("../utils/mediaSettings.util");
const { makeBlurPreview } = require("../utils/uploadFile.util");

test("preview settings reject invalid values and preserve zero blur", () => {
  assert.equal(normalizeMediaSettings({ blurAmount: 0 }).blurAmount, 0);
  for (const input of [{ quality: 0 }, { quality: 101 }, { blurAmount: -1 }, { maxDimension: 512 }, { hashComponentsX: 10 }, { hashEnabled: "false" }, { quality: null }, { quality: "35" }]) {
    assert.throws(() => normalizeMediaSettings(input), (error) => error.statusCode === 400);
  }
});

test("preview generation applies global quality, dimensions and per-image BlurHash", async () => {
  const makeFile = async (color) => ({ buffer: await sharp({ create: { width: 200, height: 100, channels: 3, background: color } }).png().toBuffer() });
  const settings = { ...defaults, maxDimension: 32, quality: 18, blurAmount: 5, hashComponentsX: 3, hashComponentsY: 2 };
  const red = await makeBlurPreview(await makeFile("red"), "png", settings);
  const blue = await makeBlurPreview(await makeFile("blue"), "png", settings);
  assert.equal(red.width, 32);
  assert.equal(red.height, 16);
  assert.equal(red.quality, 18);
  assert.equal(red.blurAmount, 5);
  assert.equal(isBlurhashValid(red.hash).result, true);
  assert.equal(red.hash.length, 4 + 2 * 3 * 2);
  assert.notEqual(red.hash, blue.hash);
  const metadata = await sharp(red.fileBuffer).metadata();
  assert.equal(metadata.width, 32);
  assert.equal(metadata.height, 16);
  const disabled = await makeBlurPreview(await makeFile("red"), "png", { ...settings, hashEnabled: false });
  assert.equal(disabled.hash, "");
});

test("game, article, slider and genre schemas retain full preview metadata", () => {
  for (const [name, field] of [["game", "cover"], ["article", "cardCover"], ["slider", "image"], ["genre", "image"]]) {
    const Model = require(`../models/${name}.model`);
    const model = new Model({ [field]: { blur: { hash: "sample", quality: 22, blurAmount: 7, url: "https://example.test/poor.webp" } } });
    assert.equal(model[field].blur.hash, "sample");
    assert.equal(model[field].blur.quality, 22);
    assert.equal(model[field].blur.blurAmount, 7);
    assert.equal(model[field].blur.url, "https://example.test/poor.webp");
  }
});

test("settings API requires authentication, restricts writes and persists validated values", async () => {
  const express = require("express");
  const jwt = require("jsonwebtoken");
  const Model = require("../models/mediaSettings.model");
  const originalUpdate = Model.findByIdAndUpdate;
  const originalSecret = process.env.TOKEN_SECRET;
  process.env.TOKEN_SECRET = "media-settings-test-only";
  let saved;
  Model.findByIdAndUpdate = async (id, update) => { assert.equal(id, "image-preview"); saved = update.$set; };
  const app = express();
  app.use(express.json());
  app.use("/settings", require("../routes/mediaSettings.route"));
  const server = await new Promise((resolve) => { const instance = app.listen(0, "127.0.0.1", () => resolve(instance)); });
  const base = `http://127.0.0.1:${server.address().port}/settings/image-preview`;
  const headers = (role) => ({ "Content-Type": "application/json", Authorization: `Bearer ${jwt.sign({ role }, process.env.TOKEN_SECRET)}` });
  try {
    assert.equal((await fetch(base)).status, 401);
    assert.equal((await fetch(base, { method: "PATCH", headers: headers("operator"), body: JSON.stringify({ blurAmount: 9 }) })).status, 403);
    assert.equal((await fetch(base, { method: "PATCH", headers: headers("admin"), body: JSON.stringify({ quality: 101 }) })).status, 400);
    assert.equal(saved, undefined);
    const result = await fetch(base, { method: "PATCH", headers: headers("admin"), body: JSON.stringify({ blurAmount: 0, quality: 22, hashEnabled: false }) });
    assert.equal(result.status, 200);
    assert.equal((await result.json()).data.quality, 22);
    assert.equal(saved.blurAmount, 0);
    assert.equal(saved.hashEnabled, false);
  } finally {
    Model.findByIdAndUpdate = originalUpdate;
    if (originalSecret === undefined) delete process.env.TOKEN_SECRET;
    else process.env.TOKEN_SECRET = originalSecret;
    await new Promise((resolve) => server.close(resolve));
  }
});
