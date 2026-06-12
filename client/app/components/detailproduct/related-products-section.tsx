import type { ProductDetail } from "../../products2/detail-data";
import { ProductMiniCard } from "./product-mini-card";

export function RelatedProductsSection({ relatedProducts }: Pick<ProductDetail, "relatedProducts">) {
  return (
    <>
      <section className="mt-8 hidden rounded-[1.8rem] bg-[#f7f9fc] p-6 lg:block">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[2rem] font-black text-[#29467c]">محصولات مرتبط</h2>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {relatedProducts.map((item) => (
            <ProductMiniCard
              key={item.id}
              title={item.title}
              image={item.image}
              price={item.price}
              href={`/products2/${item.id}`}
            />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[1.5rem] bg-[#f7f9fc] p-4 lg:hidden">
        <h2 className="text-[2rem] font-black text-[#29467c]">محصولات مرتبط</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {relatedProducts.map((item) => (
            <div key={item.id} className="w-[270px] shrink-0">
              <ProductMiniCard
                title={item.title}
                image={item.image}
                price={item.price}
                href={`/products2/${item.id}`}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
