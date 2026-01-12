import { useState, type ReactNode } from "react";
import { ShoppingCart, Menu, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/ui/context/CartContext";
import { useSetup } from "@/ui/context/SetupContext";
import { useProducts } from "@/ui/context/ProductContext";
import { useAppState } from "@/ui/hooks/useAppState";
// import { useNotification } from "@/ui/context/NotificationContext";
// import { useTranslation } from "react-i18next";
import CartSidebar from "./CartSidebar";
import MenuSelectionSidebarMobile from "./MenuSelectionSidebarMobile";
import MobileProductGroupTabs from "./MobileProductGroupTabs";
import MobileCategoryTab from "./MobileCategoryTab";
import ModalDepartmentMobile from "../../modal/menu-selection/ModalDepartmentMobile";


/* =========================
   Fixed Header with Search (No Cart)
========================= */
const MobileHeader = ({
  onOpenMenu,
  searchValue,
  onSearchChange,
}: {
  onOpenMenu: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}) => {
  return (
    <header className="flex-shrink-0 h-14 z-30 border-b border-border bg-background flex items-center justify-between px-4 gap-3">
      {/* Menu Icon */}
      <button
        onClick={onOpenMenu}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary rounded-lg hover:bg-primary-hover active:scale-95 transition-all"
      >
        <Menu className="w-5 h-5 text-primary-foreground" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search Product"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

    </header>
  );
};

/* =========================
   Sticky Filter Section with Clickable Order Mode
========================= */
const MobileStickyFilters = ({
  searchValue,
  onOrderModeClick
}: {
  searchValue: string;
  onOrderModeClick: () => void;
}) => {
  const { state: appState } = useAppState();
  const selectedOrderModeName = appState?.selected_order_mode_name || "Dine In";

  return (
    <div className="flex-shrink-0 bg-background border-b border-border">
      <div className="p-3 space-y-3">
        {/* Order Mode Chip - Clickable */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOrderModeClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold shadow-md hover:bg-primary-hover active:scale-95 transition-all"
          >
            <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
            {selectedOrderModeName}
          </button>
        </div>

        {/* Product Groups - Only show if no search */}
        {!searchValue.trim() && <MobileProductGroupTabs />}

        {/* Categories - Only show if no search */}
        {!searchValue.trim() && <MobileCategoryTab />}
      </div>
    </div>
  );
};

/* =========================
   Fixed Bottom Cart Bar with View Cart Button
========================= */
const MobileBottomCartBar = ({ onOpenCart }: { onOpenCart: () => void }) => {
  const { items } = useCart();
  const { currencyCode } = useSetup();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;

  return (
    <div className="sticky bottom-8 left-0 right-0 z-40 pointer-events-none safe-area-bottom">
      <div className="px-4 pb-4 pt-2">
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={hasItems ? onOpenCart : undefined}
          disabled={!hasItems}
          className={`
            w-full h-16 px-6 rounded-2xl
            flex items-center justify-between
            shadow-[0_4px_20px_rgba(0,0,0,0.15)]
            pointer-events-auto
            transition-all duration-300
            ${hasItems
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-[0_6px_24px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`p-2 rounded-xl ${hasItems ? 'bg-white/20' : 'bg-gray-200'}`}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">
                {hasItems ? `${itemCount} ${itemCount === 1 ? 'Item' : 'Items'}` : 'Cart Empty'}
              </div>
              <div className={`text-xs ${hasItems ? 'text-white/80' : 'text-gray-500'}`}>
                {hasItems ? 'Tap to view' : 'Add items to cart'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs opacity-80">Total</div>
              <div className="font-bold text-xl">
                {currencyCode}{total.toFixed(2)}
              </div>
            </div>
            {hasItems && (
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
};



const MobileView = ({ children }: { children?: ReactNode }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOrderModeModal, setShowOrderModeModal] = useState(false);
  const { search, setSearch } = useProducts();
  const { state: appState, setOrderMode } = useAppState();
  // const { showNotification } = useNotification();
  // const { t } = useTranslation();

  const handleOrderModeSelect = async (mode: { id: string; name: string }) => {
    if (!appState) return;

    const { order_mode_ids, order_mode_names } = appState;

    if (!order_mode_ids || !order_mode_names) return;

    console.log("🟦 Mobile: Calling setOrderMode with:", mode.id);

    await setOrderMode(
      order_mode_ids ?? [],
      order_mode_names ?? [],
      mode.id,
      mode.name
    );

    setShowOrderModeModal(false);
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col">
      {/* CART SIDEBAR (LEFT) */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* MENU SIDEBAR (RIGHT) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-[75%] max-w-[280px] z-50 shadow-xl bg-background safe-area"
            >
              <MenuSelectionSidebarMobile onClose={() => setMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ORDER MODE MODAL */}
      {showOrderModeModal && (
        <ModalDepartmentMobile
          open={showOrderModeModal}
          onClose={() => setShowOrderModeModal(false)}
          onSelect={handleOrderModeSelect}
        />
      )}

      {/* FIXED HEADER */}
      <MobileHeader
        onOpenMenu={() => setMenuOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* STICKY FILTERS */}
      <MobileStickyFilters
        searchValue={search}
        onOrderModeClick={() => setShowOrderModeModal(true)}
      />

      {/* SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>


      {/* FIXED BOTTOM CART BAR */}
      <MobileBottomCartBar onOpenCart={() => setCartOpen(true)} />
    </div>
  );
};

export default MobileView;