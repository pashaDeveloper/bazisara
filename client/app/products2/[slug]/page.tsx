import { notFound } from "next/navigation";
import { products } from "../data";
import { getProductDetail } from "../detail-data";
import { ProductDetailView } from "./detail-view";

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.id.toString() }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = getProductDetail(Number(slug));

  if (!detail) {
    notFound();
  }

  return <ProductDetailView detail={detail} />;
}
