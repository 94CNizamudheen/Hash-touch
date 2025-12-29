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

  const handleAddToOrder = useCallback(
    (item: Product) => addItem(item),
    [addItem]
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
      )}
    </>
  );
};

export default ProductsMobile;
