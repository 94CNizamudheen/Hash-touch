import type { Product } from "@/types/products";
import { useProducts } from "@/ui/context/ProductContext";
import { useCallback, useEffect, useRef, useState } from "react";
import InputFilter from "../../common/InputFilter";
import CategoryTabs from "./CategoryTabs";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";
import ProductGroupTabs from "./ProductGroupTabs";
import ProductTagGroupModal from "./ProductTagGroupModal";
import { getProductWithCombinations } from "@/services/local/product-combo.local.service";
import { useTranslation } from "react-i18next";


export default function Products({
  onAddToOrder,
  tempStyle,
}: {
  onAddToOrder: (item: Product, modifiers?: { name: string; qty: number; price: number }[]) => void;
  tempStyle: boolean;
}) {
  const {
    filteredItems,
    selectedCategory,
    search,
    setSearch,
    loading,
  } = useProducts();
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleProductClick = async (item: Product) => {
    try {
      const productData = await getProductWithCombinations(item.id);

      // If product has tag groups, open modal
      if (productData.combinations && productData.combinations.length > 0) {
        setSelectedProduct(item);
        setModalOpen(true);
      } else {
        // No tag groups, add directly to cart
        onAddToOrder(item, []);
      }
    } catch (error) {
      console.error("Failed to check product combinations:", error);
      // On error, add directly to cart
      onAddToOrder(item, []);
    }
  };

  const handleModalConfirm = (modifiers: { name: string; qty: number; price: number }[]) => {
    if (selectedProduct) {
      onAddToOrder(selectedProduct, modifiers);
    }
  };

  useEffect(() => {
    productGridRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [selectedCategory]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, [setSearch]);

  return (
    <section className="w-full h-full flex flex-col bg-background overflow-hidden transition-all duration-300">

      <div className="p-4 border-b border-border bg-background sticky top-0 z-10 space-y-3">
        <InputFilter
          className="w-full"
          placeholder={t("Search product...")}
          value={search}
          onChange={handleSearchChange}
        />
        {!search.trim() && <ProductGroupTabs />}
      </div>

      {/* ================= tempStyle = true ================= */}
      {tempStyle ? (
        <div className="flex flex-1 overflow-hidden">
          {!search.trim() && (
            <aside className="">
              <CategoryTabs direction="vertical" />
            </aside>
          )}

          <div
            ref={productGridRef}
            className="flex-1 overflow-y-auto no-scrollbar p-5 bg-background"
          >
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">
                {t("Loading products...")}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 content-start">
                {filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    name={item.name}
                    isSoldOut={item.is_sold_out===1}
                    price={item.price}
                    image={getProductImage(item.media)}
                    onClick={() => handleProductClick(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                {t("No products found")}
              </div>
            )}
          </div>
        </div>
      ) : (

        <>
          {!search.trim() && <CategoryTabs direction="horizontal" />}

          <div
            ref={productGridRef}
            className={cn(
              "flex-1 overflow-y-auto no-scrollbar p-5 bg-background",
              "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 content-start"
            )}
          >

            {loading ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                {t("Loading products...")}
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  name={item.name}
                  price={item.price}
                  image={getProductImage(item.media)}
                  isSoldOut={item.is_sold_out === 1}
                  onClick={() => handleProductClick(item)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                {t("No products found")}
              </div>
            )}
          </div>
        </>
      )}

      {selectedProduct && (
        <ProductTagGroupModal
          open={modalOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productPrice={selectedProduct.price}
          onClose={() => setModalOpen(false)}
          onConfirm={handleModalConfirm}
        />
      )}
    </section>
  );
}
