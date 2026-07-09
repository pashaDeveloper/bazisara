import ArticleDetailPage, { generateMetadata as generateArticleMetadata } from "../../../articles/[slug]/[id]/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const generateMetadata = generateArticleMetadata;

export default ArticleDetailPage;
