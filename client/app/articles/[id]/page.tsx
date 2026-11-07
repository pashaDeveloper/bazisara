import { redirect } from "next/navigation";
import type { Article } from "../../lib/api";
import { getApiItem } from "../../lib/api";
import { articleHref } from "../../lib/content-routes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArticleLegacyRedirectPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getApiItem<Article>("/magazines", id);

  if (!article) {
    redirect("/magazines");
  }

  redirect(articleHref(article));
}
