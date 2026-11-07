export function flattenCategoryTree(nodes = [], parents = [], slugs = []) {
  return nodes.flatMap((node) => {
    const names = [...parents, node.name];
    const segment = node.slug || String(node.name || "").trim().toLowerCase().replace(/[\s_\u200c]+/g, "-").replace(/[^a-z0-9\u0600-\u06ff-]+/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const path = [...slugs, segment];
    return [
      { ...node, label: names.join(" / "), categoryPath: path },
      ...flattenCategoryTree(node.children || [], names, path),
    ];
  });
}
