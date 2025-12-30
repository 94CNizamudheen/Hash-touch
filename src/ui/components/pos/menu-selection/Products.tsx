import type { Product } from "@/types/products";
import { useProducts } from "@/ui/context/ProductContext";
import { useEffect, useRef } from "react";
import InputFilter from "../../common/InputFilter";
import CategoryTabs from "./CategoryTabs";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";
import ProductGroupTabs from "./ProductGroupTabs";


export default function Products({
  onAddToOrder,
  tempStyle,
}: {
  onAddToOrder: (item: Product) => void;
  tempStyle: boolean;
}) {
  const {
    filteredItems,
    selectedCategory,
    search,
    setSearch,
    loading,
  } = useProducts();


  const productGridRef = useRef<HTMLDivElement | null>(null);

  function getProductImage(media?: string): string | undefined {
    try {
      if (!media) return undefined;
      const arr = JSON.parse(media);
      return arr?.[0]?.filepath || undefined;
    } catch {
      return undefined;
    }
  }


  useEffect(() => {
    productGridRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [selectedCategory]);


  return (
    <section className="w-full h-full flex flex-col bg-background overflow-hidden transition-all duration-300">

      <div className="p-4 border-b border-border bg-background sticky top-0 z-10 space-y-3">
        <InputFilter
          className="w-full"
          placeholder="Search product..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />
        <ProductGroupTabs />
      </div>

      {/* ================= tempStyle = true ================= */}
      {tempStyle ? (
        <div className="flex flex-1 overflow-hidden">
          <aside className="">
              <CategoryTabs direction="vertical" />
          </aside>

          <div
            ref={productGridRef}
            className="flex-1 overflow-y-auto no-scrollbar p-5 bg-background"
          >
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">
                Loading products...
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 content-start">
                {filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    name={item.name}
                    price={item.price}
                    image={getProductImage(item.media)}
                    onClick={() => onAddToOrder(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No products found
              </div>
            )}
          </div>
        </div>
      ) : (

        <>

            <CategoryTabs direction="horizontal" />
          <div
            ref={productGridRef}
            className={cn(
              "flex-1 overflow-y-auto no-scrollbar p-5 bg-background",
              "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 content-start"
            )}
          >

            {loading ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                Loading products...
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  name={item.name}
                  price={item.price}
                  image={getProductImage(item.media)}
                  onClick={() => onAddToOrder(item)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No products found
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
