import { notFound } from "next/navigation";
import { products } from "../data";
import { getProductDetail } from "../detail-data";
import { ProductDetailView } from "./detail-view";

export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id.toString() }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getProductDetail(Number(id));

  if (!detail) {
    notFound();
  }

  return <ProductDetailView detail={detail} />;
}
