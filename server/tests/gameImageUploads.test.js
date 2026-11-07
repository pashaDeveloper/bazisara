const assert = require("node:assert/strict");
const { test } = require("node:test");
const sharp = require("sharp");
const {
  getGameImagePrepareOptions,
  makeObjectName,
  makePoorImageKey,
  makeMobileImageKey,
  prepareFile,
} = require("../utils/uploadFile.util");

test("game filenames use names, roles and screenshot numbers without dimensions", () => {
  for (const [field, suffix] of [
    ["cover", "cover"], ["dlcImages", "coverdlc"],
    ["desktopCover", "coverdesk"], ["mobileCover", "covermob"],
  ]) {
    const result = makeObjectName("games", "webp", { title: "GTA V" }, { field, width: 768, height: 768 });
    assert.equal(result.filename, `GTA-V-${suffix}.webp`);
    assert.ok(result.key.endsWith(`/${result.filename}`));
    assert.equal(makePoorImageKey(result.key).split("/").pop(), `GTA-V-poor${suffix}.webp`);
  }
  const body = { entityType: "game", entityName: "Dead space", mediaRole: "gallery", mediaIndex: 5 };
  const result = makeObjectName("page-builder", "webp", body, { width: 1920, height: 1080 });
  assert.equal(result.filename, "Dead-space-gameplayscreenshot05.webp");
  assert.ok(makePoorImageKey(result.key).endsWith("/Dead-space-poor-gameplayscreenshot05.webp"));
  assert.notEqual(result.key, makeObjectName("page-builder", "webp", body, { width: 1920, height: 1080 }).key);
});

test("variant deletion supports both patterned filenames and legacy uploads", () => {
  assert.equal(makePoorImageKey("game/GTA-V-768x768-cover.webp"), "game/GTA-V-768x768-poorcover.webp");
  assert.equal(makeMobileImageKey("game/GTA-V-768x768-cover.webp"), "game/GTA-V-640x640-cover.webp");
  assert.equal(makePoorImageKey("game/old-random.webp"), "game/old-random-blur.webp");
  assert.equal(makeMobileImageKey("game/old-random.webp"), "game/old-random-mobile.webp");
});

test("game preparation preserves configured WebP dimensions", async () => {
  const buffer = await sharp({ create: { width: 40, height: 30, channels: 3, background: "red" } }).png().toBuffer();
  const file = { buffer, originalname: "photo.png", mimetype: "image/png" };
  for (const [role, width, height] of [["cover", 768, 768], ["gallery", 1920, 1080], ["desktopCover", 1920, 1080], ["mobileCover", 1080, 810]]) {
    const prepared = await prepareFile(file, getGameImagePrepareOptions({ mediaRole: role }));
    const metadata = await sharp(prepared.fileBuffer).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
  }
});

test("multipart game uploads store cover, poor preview and mobile variant with matching names", async () => {
  const express = require("express");
  const { S3Client } = require("@aws-sdk/client-s3");
  const originalSend = S3Client.prototype.send;
  const originalBaseUrl = process.env.ARVAN_PUBLIC_BASE_URL;
  process.env.ARVAN_PUBLIC_BASE_URL = "https://example.test";
  const objects = [];
  S3Client.prototype.send = async function (command) { objects.push(command.input); return {}; };
  let server;
  try {
    const upload = require("../middleware/arvanUpload.middleware");
    const app = express();
    app.post("/upload", upload("page-builder").single("file"), (req, res) => res.json(req.uploadedFiles.file[0]));
    app.post("/game", upload("games").fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 2 }]), (req, res) => res.json(req.uploadedFiles));
    server = await new Promise((resolve) => { const instance = app.listen(0, "127.0.0.1", () => resolve(instance)); });
    const buffer = await sharp({ create: { width: 40, height: 30, channels: 3, background: "blue" } }).png().toBuffer();
    const form = new FormData();
    form.append("entityType", "game");
    form.append("entityName", "GTA V");
    form.append("mediaRole", "cover");
    form.append("file", new Blob([buffer], { type: "image/png" }), "source.png");
    const response = await fetch(`http://127.0.0.1:${server.address().port}/upload`, { method: "POST", body: form });
    assert.equal(response.status, 200);
    const media = await response.json();
    assert.equal(media.filename, "GTA-V-cover.webp");
    assert.ok(media.blur.public_id.endsWith("/GTA-V-poorcover.webp"));
    assert.equal(objects.length, 2);
    assert.ok(objects.some((object) => object.Key === media.blur.public_id));
    const actual = await sharp(objects.find((object) => object.Key === media.public_id).Body).metadata();
    assert.equal(actual.width, 768);
    assert.equal(actual.height, 768);
    objects.length = 0;
    const directForm = new FormData();
    directForm.append("title", "Dead space");
    directForm.append("cover", new Blob([buffer], { type: "image/png" }), "cover.png");
    for (let index = 0; index < 2; index += 1) {
      directForm.append("gallery", new Blob([buffer], { type: "image/png" }), `${index}.png`);
    }
    const directResponse = await fetch(`http://127.0.0.1:${server.address().port}/game`, { method: "POST", body: directForm });
    assert.equal(directResponse.status, 200);
    const directMedia = await directResponse.json();
    assert.ok(directMedia.cover[0].mobile.public_id.endsWith("/Dead-space-cover-mobile.webp"));
    assert.equal(directMedia.gallery[0].filename, "Dead-space-gameplayscreenshot01.webp");
    assert.equal(directMedia.gallery[1].filename, "Dead-space-gameplayscreenshot02.webp");
    assert.ok(directMedia.gallery[1].blur.public_id.endsWith("/Dead-space-poor-gameplayscreenshot02.webp"));
    assert.equal(objects.length, 7);
  } finally {
    S3Client.prototype.send = originalSend;
    if (originalBaseUrl === undefined) delete process.env.ARVAN_PUBLIC_BASE_URL;
    else process.env.ARVAN_PUBLIC_BASE_URL = originalBaseUrl;
    if (server) await new Promise((resolve) => server.close(resolve));
  }
});
