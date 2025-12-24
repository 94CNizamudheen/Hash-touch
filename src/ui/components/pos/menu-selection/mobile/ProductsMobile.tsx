import { useCallback,  } from "react";
import { useProducts } from "@/ui/context/ProductContext";
import { useCart } from "@/ui/context/CartContext";
import ProductCardMobile from "./ProductCardMobile";
import MobileCategoryTab from "./MobileCategoryTab";
import MobileProductGroupTabs from "./MobileProductGroupTabs";
import InputFilter from "@/ui/components/common/InputFilter";
import type { Product } from "@/types/products";
import { useAppState } from "@/ui/hooks/useAppState";

const ProductsMobile = () => {
  const {
    filteredItems,
    search,
    setSearch,
    loading,
  } = useProducts();

  const { addItem } = useCart();
  const { state: appState } = useAppState();

  const handleAddToOrder = useCallback(
    (item: Product) => addItem(item),
    [addItem]
  );

  return (
    <section key={appState?.selected_order_mode_id} className="w-full min-h-full flex flex-col bg-background">
      {/* 🔝 Sticky Top Controls */}
      <div className="sticky top-0 z-10 p-3 flex flex-col gap-3 border-b border-border bg-background">
        <InputFilter
          className="w-full"
          placeholder="Search product..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />

        <MobileProductGroupTabs />

        <MobileCategoryTab />
      </div>


      <div className="grid grid-cols-2 gap-3 p-3">
        {loading ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            Loading products...
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ProductCardMobile
              key={item.id}
              item={item}
              onAdd={handleAddToOrder}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No products found
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsMobile;
