import { notFound, permanentRedirect } from "next/navigation";
import ArticleDetailPage, { generateMetadata as articleMetadata } from "../../articles/[id]/[slug]/page";
import { CatalogBrowser } from "../../components/catalog-browser";
import type { Article, NamedEntity } from "../../lib/api";
import { getApiItem, getApiList } from "../../lib/api";
import { articleCategorySegments, articleHref } from "../../lib/content-routes";

export const dynamic = "force-dynamic";
export const revalidate = 0;
type Props = { params: Promise<{ segments: string[] }> };
type CategoryNode = NamedEntity & { children?: CategoryNode[] };

function findCategory(nodes: CategoryNode[], path: string[], parent?: NamedEntity): NamedEntity | null {
  for (const node of nodes) {
    const category = { ...node, parent: parent || null };
    if (articleCategorySegments(category).join("/") === path.join("/")) return category;
    const child = findCategory(node.children || [], path, category);
    if (child) return child;
  }
  return null;
}

async function resolveArticle(segments: string[]) {
  for (const value of [...new Set([segments.at(-2), segments.at(-1)])]) {
    if (!value) continue;
    const article = await getApiItem<Article>("/magazines", value);
    if (article) return article;
  }
  return null;
}

export async function generateMetadata({ params }: Props) {
  const { segments } = await params;
  const category = findCategory(await getApiList<CategoryNode>("/categories/tree"), segments);
  if (category) return { title: `${category.name} | مجله بازی بازار` };
  const article = await resolveArticle(segments);
  if (article) return articleMetadata({ params: Promise.resolve({ id: article.magazineId || article._id, slug: article.slug || "" }) });
  return { title: "مجله بازی بازار" };
}

export default async function MagazinePage({ params }: Props) {
  const { segments } = await params;
  const path = `/magazine/${segments.join("/")}`;
  const tree = await getApiList<CategoryNode>("/categories/tree");
  const category = findCategory(tree, segments);
  if (category?._id) {
    const articles = await getApiList<Article>(`/magazines/all?category=${encodeURIComponent(category._id)}&includeDescendants=true`, 100);
    return <div className="min-h-screen bg-[#f8fafc] text-zinc-950"><CatalogBrowser items={articles} kind="article" label="مجله بازی بازار" title={category.name || "مجله"} subtitle="مطالب این دسته‌بندی و زیر‌دسته‌های آن" /></div>;
  }
  const article = await resolveArticle(segments);
  if (article) {
    const canonical = articleHref(article);
    if (path !== canonical) permanentRedirect(canonical);
    return ArticleDetailPage({ params: Promise.resolve({ id: article.magazineId || article._id, slug: article.slug || "", canonicalPath: path }) });
  }
  notFound();
}
