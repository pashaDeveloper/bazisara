import type { ProductDetail } from "../detail-data";
import {
  ActionsRail,
  ArticlesSection,
  Breadcrumbs,
  CommentsSection,
  MobileProductHero,
  ProductGallery,
  ProductInfoPanel,
  PurchaseSidebar,
  RelatedProductsSection,
  TabsSection,
} from "../../components/detailproduct";
import { MobilePurchaseBar } from "./purchase-actions";

export function ProductDetailView({ detail }: { detail: ProductDetail }) {
  const {
    product,
    breadcrumbs,
    priceLabel,
    reactionScore,
    selectedReaction,
    tabs,
    activeTab,
    summary,
    commentsTitle,
    relatedProducts,
    articles,
    comments,
    gallery,
  } = detail;

  return (
    <div className="min-h-screen bg-[#fbfcfe] text-[#1f2937]">
      <main className="mx-auto px-4 pb-32 pt-4 lg:px-8 lg:pb-20 lg:pt-8">
        <Breadcrumbs items={breadcrumbs} />

        <div
          dir="ltr"
          className="mt-6 hidden gap-6 lg:grid lg:grid-cols-[84px_300px_minmax(0,1fr)_620px]"
        >
          <ActionsRail />
          <PurchaseSidebar
            productId={product.id}
            title={product.title}
            priceLabel={priceLabel}
            price={product.price}
            image={product.image}
            reactionScore={reactionScore}
            selectedReaction={selectedReaction}
          />
          <ProductInfoPanel detail={detail} />
          <ProductGallery title={product.title} gallery={gallery} />
        </div>

        <MobileProductHero detail={detail} />
        <TabsSection tabs={tabs} activeTab={activeTab} summary={summary} />
        <RelatedProductsSection relatedProducts={relatedProducts} />
        <CommentsSection commentsTitle={commentsTitle} comments={comments} />
        <ArticlesSection articles={articles} />
      </main>

      <MobilePurchaseBar
        productId={product.id}
        title={product.title}
        price={product.price}
        image={product.image}
      />
    </div>
  );
}
