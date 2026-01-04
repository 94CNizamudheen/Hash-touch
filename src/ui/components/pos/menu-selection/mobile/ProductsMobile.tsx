import { useCallback, useState } from "react";
import { useProducts } from "@/ui/context/ProductContext";
import { useCart } from "@/ui/context/CartContext";
import ProductCardMobile from "./ProductCardMobile";
import MobileCategoryTab from "./MobileCategoryTab";
import MobileProductGroupTabs from "./MobileProductGroupTabs";
import InputFilter from "@/ui/components/common/InputFilter";
import type { Product } from "@/types/products";
import { useAppState } from "@/ui/hooks/useAppState";
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import StartShiftModal from "../../modal/work-shift/StartShiftModal";
import WorkShiftSuccessModal from "../../modal/work-shift/WorkShiftSuccessModal";
import { useLogout } from "@/ui/context/LogoutContext";
import SplashScreen from "@/ui/components/common/SplashScreen";
import ProductTagGroupModal from "../ProductTagGroupModal";
import { getProductWithCombinations } from "@/services/local/product-combo.local.service";

const ProductsMobile = () => {
  const {
    filteredItems,
    search,
    setSearch,
    loading,
  } = useProducts();

  const { addItem } = useCart();
  const { state: appState } = useAppState();
  const { shift, isHydrated } = useWorkShift();
  const [showSuccess, setShowSuccess] = useState(false);
  const { isLoggingOut } = useLogout();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddToOrder = useCallback(
    async (item: Product) => {
      try {
        const productData = await getProductWithCombinations(item.id);

        // If product has tag groups, open modal
        if (productData.combinations && productData.combinations.length > 0) {
          setSelectedProduct(item);
          setModalOpen(true);
        } else {
          // No tag groups, add directly to cart
          addItem(item, []);
        }
      } catch (error) {
        console.error("Failed to check product combinations:", error);
        // On error, add directly to cart
        addItem(item, []);
      }
    },
    [addItem]
  );

  const handleModalConfirm = useCallback(
    (modifiers: { name: string; qty: number; price: number }[]) => {
      if (selectedProduct) {
        addItem(selectedProduct, modifiers);
      }
    },
    [selectedProduct, addItem]
  );

  if (!isHydrated) return null;

  // If logging out, show splash screen instead of shift modals
  if (isLoggingOut) {
    return <SplashScreen type={1} />;
  }

  // Show StartShiftModal only if there's no shift data at all
  const shouldShowStart = !shift;
  // Show main UI if shift exists (even if closed) - this allows logout flow to complete
  const shouldShowMainUI = !!shift;

  return (
    <>
      {shouldShowStart && (
        <StartShiftModal
          onClose={() => {}}
          onSuccess={() => setShowSuccess(true)}
        />
      )}

      {showSuccess && shift?.isOpen && (
        <WorkShiftSuccessModal onClose={() => setShowSuccess(false)} />
      )}

      {shouldShowMainUI && !showSuccess && (
        <section key={appState?.selected_order_mode_id} className="w-full min-h-full flex flex-col bg-background">
          <div className="sticky top-0 z-10 p-3 flex flex-col gap-3 border-b border-border bg-background">
            <InputFilter
              className="w-full"
              placeholder="Search product..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
            />

            {!search.trim() && <MobileProductGroupTabs />}

            {!search.trim() && <MobileCategoryTab />}
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
      )}
    </>
  );
};

export default ProductsMobile;
