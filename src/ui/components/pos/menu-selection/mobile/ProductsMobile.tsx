import { useCallback } from "react";
import { useProducts } from "@/ui/context/ProductContext";
import { useOrder } from "@/ui/context/OrderContext"; 
import ProductCardMobile from "./ProductCardMobile";
import MobileCategoryTab from "./MobileCategoryTab";
import InputFilter from "@/ui/components/common/InputFilter";
import type { Product } from "@/types/products";

const ProductsMobile = () => {
  const {
    filteredItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    search,
    setSearch,
  } = useProducts();

  const { addToOrder } = useOrder();

  const handleAddToOrder = useCallback(
    (item: Product) => addToOrder(item),
    [addToOrder]
  );

  return (
    <section className="w-full min-h-full flex flex-col bg-background">
      <div className="sticky top-0 z-10 p-3 flex flex-col gap-3 border-b border-border bg-background">
        <InputFilter
          className="w-full"
          placeholder="Search product..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />
        <MobileCategoryTab
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          categories={categories}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 p-3">
        {filteredItems.map((item) => (
          <ProductCardMobile
            key={item.id}
            item={item}
            onAdd={handleAddToOrder}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductsMobile;
