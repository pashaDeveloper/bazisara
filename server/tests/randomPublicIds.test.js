const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const Reservation = require("../models/publicIdReservation.model");
const { randomPublicId, isRandomPublicId, nextRandomPublicId } = require("../utils/publicId.util");
const { migrateModel } = require("../scripts/migrateRandomPublicIds");

test("game and magazine codes have five random lowercase letters/digits after their prefixes", () => {
  for (const prefix of ["bazi", "mag"]) {
    const samples = Array.from({ length: 100 }, () => randomPublicId(prefix));
    assert.ok(samples.every((value) => isRandomPublicId(value, prefix)));
    assert.ok(new Set(samples).size > 1);
  }
  assert.equal(isRandomPublicId("bb-1033", "bazi"), false);
  assert.equal(isRandomPublicId("MAG000001", "mag"), false);
});

test("reservation retries both concurrent reservations and codes already used by content", async () => {
  const original = Reservation.create;
  let reservations = 0;
  let lookups = 0;
  Reservation.create = async () => { if (++reservations === 1) throw Object.assign(new Error("duplicate"), { code: 11000 }); };
  try {
    const id = await nextRandomPublicId("bazi", { exists: async () => ++lookups === 1 }, "gameId");
    assert.match(id, /^bazi[a-z0-9]{5}$/);
    assert.equal(reservations, 3);
    assert.equal(lookups, 2);
  } finally { Reservation.create = original; }
});

test("migration preserves old URL identifiers and skips already migrated documents", async () => {
  const original = Reservation.create;
  Reservation.create = async () => {};
  const updates = [];
  const docs = [{ _id: "one", gameId: "bb-1033" }, { _id: "two", gameId: "baziabc12" }];
  const Model = {
    modelName: "FakeGame", exists: async () => false,
    find() { return { select() { return this; }, lean() { return this; }, async *cursor() { yield* docs; } }; },
    async updateOne(filter, update) { updates.push({ filter, update }); return { modifiedCount: 1 }; },
  };
  try {
    assert.deepEqual(await migrateModel({ Model, field: "gameId", prefix: "bazi" }), { candidates: 1, updated: 0 });
    assert.equal(updates.length, 0);
    assert.deepEqual(await migrateModel({ Model, field: "gameId", prefix: "bazi", apply: true }), { candidates: 1, updated: 1 });
    assert.equal(updates[0].filter.gameId, "bb-1033");
    assert.equal(updates[0].update.$addToSet.legacyPublicIds, "bb-1033");
    assert.match(updates[0].update.$set.gameId, /^bazi[a-z0-9]{5}$/);
  } finally { Reservation.create = original; }
});

function loadClientTs(filename) {
  const ts = require("../../client/node_modules/typescript");
  const absolute = path.resolve(__dirname, "../../client/app/lib", filename);
  const output = ts.transpileModule(fs.readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", output)((request) => loadClientTs(`${request.replace(/^\.\//, "")}.ts`), module, module.exports);
  return module.exports;
}

test("canonical links put IDs before slugs and include the magazine category hierarchy", () => {
  const { gameHref, articleHref, articleCategorySegments } = loadClientTs("content-routes.ts");
  assert.equal(gameHref({ _id: "internal", gameId: "baziabc12", title: "UFC 6" }), "/games/baziabc12/ufc-6");
  const root = { _id: "root", name: "مجله", slug: "magazine" };
  const parent = { _id: "parent", name: "آموزش", slug: "tutorial", parent: root };
  const child = { _id: "child", name: "پلی استیشن", slug: "playstation", parent };
  const article = { _id: "internal", magazineId: "magabc12", title: "Enabling PSN", category: child };
  assert.equal(articleHref(article), "/magazine/tutorial/playstation/magabc12/enabling-psn");
  assert.deepEqual(articleCategorySegments(child), ["tutorial", "playstation"]);
  assert.equal(articleHref({ ...article, category: null }), "/magazine/magabc12/enabling-psn");
});

test("public APIs accept both random IDs and legacy aliases after migration", async () => {
  const Game = require("../models/game.model");
  const Article = require("../models/article.model");
  const gameService = require("../services/game.service");
  const articleService = require("../services/article.service");
  for (const [Model, service, method, ids] of [[Game, gameService, "getGame", ["baziabc12", "bb-1033"]], [Article, articleService, "getArticle", ["magabc12", "MAG000001"]]]) {
    const original = Model.findOne;
    let query;
    Model.findOne = (filter) => {
      query = filter;
      return { populate() { return this; }, then(resolve) { return Promise.resolve({ _id: "internal" }).then(resolve); } };
    };
    try {
      for (const id of ids) {
        const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
        await service[method]({ params: { id } }, res);
        assert.equal(res.code, 200);
        assert.ok(query.$or.some((filter) => Object.values(filter).includes(id)));
      }
    } finally { Model.findOne = original; }
  }
});
