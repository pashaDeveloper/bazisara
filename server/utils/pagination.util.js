function normalizePositiveInteger(value, fallback, max) {
  const number = Number.parseInt(value, 10);

  if (Number.isNaN(number) || number < 1) {
    return fallback;
  }

  return max ? Math.min(number, max) : number;
}

function getPaginationOptions(query = {}) {
  const page = normalizePositiveInteger(query.page, 1);
  const limit = normalizePositiveInteger(query.limit, 10, 100);
  const skip = (page - 1) * limit;

  return { limit, page, skip };
}

function buildPaginationMeta({ limit, page, totalItems }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    limit,
    totalItems,
    totalPages,
  };
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSearchTerm(query = {}) {
  return String(query.search || "").trim();
}

function buildSearchQuery(search, fields = []) {
  if (!search || !fields.length) {
    return {};
  }

  const regex = new RegExp(escapeRegex(search), "i");

  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
}

module.exports = {
  buildSearchQuery,
  buildPaginationMeta,
  getPaginationOptions,
  getSearchTerm,
};
