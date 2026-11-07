const assert = require("node:assert/strict");
const { test } = require("node:test");
const Category = require("../models/category.model");
const Article = require("../models/article.model");
const service = require("../services/article.service");

test("category slugs persist and category selectors retain complete parent/child paths", async () => {
  const category = new Category({ name: "آموزش", slug: "Tutorial" });
  await category.validate();
  assert.equal(category.slug, "tutorial");
  const { flattenCategoryTree } = await import("../../dashboard/src/utils/categoryTree.js");
  const tree = [{ _id: "root", name: "مجله", slug: "magazine", children: [{ _id: "tutorial", name: "آموزش", slug: "tutorial", children: [{ _id: "child", name: "پلی استیشن", slug: "playstation" }] }] }];
  const items = flattenCategoryTree(tree);
  assert.equal(items.length, 3);
  assert.equal(items[2].label, "مجله / آموزش / پلی استیشن");
  assert.deepEqual(items[2].categoryPath, ["magazine", "tutorial", "playstation"]);
});

test("magazine category pages include all descendant categories", async () => {
  const root = "507f1f77bcf86cd799439011";
  const originalCategoryFind = Category.find;
  const originalArticleFind = Article.find;
  const originalCount = Article.countDocuments;
  let actualFilter;
  Category.find = () => ({ select() { return this; }, async lean() { return [{ _id: root, parent: null }, { _id: "child", parent: root }, { _id: "grandchild", parent: "child" }, { _id: "other", parent: null }]; } });
  Article.find = (filter) => {
    actualFilter = filter;
    return { populate() { return this; }, sort() { return this; }, skip() { return this; }, limit() { return this; }, then(resolve) { return Promise.resolve([]).then(resolve); } };
  };
  Article.countDocuments = async () => 0;
  const res = { status(code) { this.code = code; return this; }, json() {} };
  try {
    await service.getArticles({ query: { category: root, includeDescendants: "true" } }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(actualFilter.category.$in, [root, "child", "grandchild"]);
  } finally {
    Category.find = originalCategoryFind;
    Article.find = originalArticleFind;
    Article.countDocuments = originalCount;
  }
});
