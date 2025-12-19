import type { Product } from "@/types/products";
import { useProducts } from "@/ui/context/ProductContext";
import { useEffect, useRef } from "react";
import InputFilter from "../../common/InputFilter";
import CategoryTabs from "../CategoryTabs";
import ProductCard from "../ProductCard";
import { cn } from "@/lib/utils";
import ProductGroupTabs from "./ProductGroupTabs";



export default function Products({ onAddToOrder,tempStyle,}: {
  onAddToOrder: (item: Product) => void;
  tempStyle: boolean;
}) {
  const { filteredItems, selectedCategory,search, setSearch, loading,} = useProducts();

  const productGridRef = useRef<HTMLDivElement | null>(null);

  function getProductImage(media?: string) {
  try {
    if (!media) return "/img/products/default.png";
    const arr = JSON.parse(media);
    return arr?.[0]?.filepath || "@ui/assets/dish-placeholder.jpg";
  } catch {
    return "/img/products/default.png";
  }
}

  // Scroll to top on category change
  useEffect(() => {
    if (productGridRef.current) {
      productGridRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [selectedCategory]);

  return (
    <section className="w-full h-full flex flex-col bg-background overflow-hidden transition-all duration-300">
      {/* 🔹 Common Search Bar on Top */}
      <div className="p-4 border-b border-border bg-background sticky top-0 z-10">
        <InputFilter
          className="w-full"
          placeholder="Search product..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />
        <ProductGroupTabs />
      </div>

      {tempStyle ? (
        <div className="flex h-full overflow-hidden">
          {/* Left Sidebar - Vertical Categories */}
          <aside className="w-[230px] border-r border-border bg-background flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              <CategoryTabs
                direction="vertical"
              />
            </div>
          </aside>

          {/* Right Side - Product Grid */}
          <div
            ref={productGridRef}
            className="flex-1 overflow-y-auto no-scrollbar p-5 bg-background"
          >
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">
                Loading products...
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols- content-start">
                {filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    name={item.name}
                    price={item.price}
                    image={getProductImage(item.media)}
                    description={item.description}
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
          <div className="shrink-0 p-5 pb-3 flex flex-col gap-4 border-b border-border bg-background">
            <CategoryTabs
              direction="horizontal"
            />
          </div>
          <div
            ref={productGridRef}
            className={cn(
              "flex-1 overflow-y-auto no-scrollbar grid gap-4 p-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 content-start"
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
                  description={item.description}
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
