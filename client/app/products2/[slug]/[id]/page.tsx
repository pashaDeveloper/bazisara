import { notFound } from "next/navigation";
import { slugify } from "../../../lib/slug";
import { products } from "../../data";
import { getProductDetail } from "../../detail-data";
import { ProductDetailView } from "../detail-view";

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: slugify(product.title) || product.id.toString(),
    id: product.id.toString(),
  }));
}

export default async function ProductDetailWithSlugPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id } = await params;
  const detail = getProductDetail(Number(id));

  if (!detail) {
    notFound();
  }

  return <ProductDetailView detail={detail} />;
}
