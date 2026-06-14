import { redirect } from "next/navigation";
import type { Article } from "../../lib/api";
import { getApiItem } from "../../lib/api";
import { slugify } from "../../lib/slug";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleLegacyRedirectPage({ params }: PageProps) {
  const { slug: id } = await params;
  const article = await getApiItem<Article>("/articles", id);

  if (!article) {
    redirect("/articles");
  }

  redirect(`/articles/${slugify(article.slug || article.title) || id}/${id}`);
}
