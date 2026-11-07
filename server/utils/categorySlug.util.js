function makeCategorySlug(value) {
  return String(value || "").trim().toLowerCase()
    .replace(/[\s_\u200c]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function categoryPopulation(depth = 20) {
  const node = { path: "category", select: "name slug parent" };
  let current = node;
  for (let index = 0; index < depth; index += 1) {
    current.populate = { path: "parent", select: "name slug parent" };
    current = current.populate;
  }
  return node;
}

module.exports = { makeCategorySlug, categoryPopulation };
