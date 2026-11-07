function makeGenreSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\u200c]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

module.exports = { makeGenreSlug };
