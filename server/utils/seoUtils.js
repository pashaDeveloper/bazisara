function normalizePersianSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\s\ـ_]+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\s\ـ_]+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function translateToEnglish(value) {
  return generateSlug(value).replace(/[\u0600-\u06FF]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || generateSlug(value);
}

module.exports = {
  generateSlug,
  normalizePersianSlug,
  translateToEnglish,
};
