const assert = require("node:assert/strict");
const { test } = require("node:test");
const Tag = require("../models/tag.model");
const service = require("../services/tag.service");

test("tag selector returns every active tag without the paginated listing limit", async () => {
  const originalFind = Tag.find;
  const tags = Array.from({ length: 250 }, (_, index) => ({ _id: String(index), name: `Tag ${index}`, slug: `tag-${index}` }));
  try {
    Tag.find = (filter) => {
      assert.deepEqual(filter, { isDeleted: false });
      return {
        select(fields) { assert.equal(fields, "name slug"); return this; },
        sort(order) { assert.deepEqual(order, { name: 1 }); return this; },
        async lean() { return tags; },
      };
    };
    const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
    await service.getTagOptions({}, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.data.length, 250);
  } finally {
    Tag.find = originalFind;
  }
});

test("each game receives the seven requested SEO suggestions", async () => {
  const { buildSelectableSeoTags, makeSeoTagSlug } = await import("../../dashboard/src/pages/games/gameSeoTags.js");
  assert.deepEqual(buildSelectableSeoTags(" GTA V "), [
    "خرید GTA V", "قیمت GTA V", "خرید بازی GTA V", "اکانت GTA V", "دیسک GTA V", "GTA V PS5", "GTA V Xbox Series",
  ]);
  assert.deepEqual(buildSelectableSeoTags(" "), []);
  assert.ok(buildSelectableSeoTags("Dead Space").every((tag) => tag.includes("Dead Space") && !tag.includes("GTA")));
  assert.equal(makeSeoTagSlug(" GTA_V PS5 "), "gta-v-ps5");
});
