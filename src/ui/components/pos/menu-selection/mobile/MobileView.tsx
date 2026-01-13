import { useState, type ReactNode } from "react";
import { Menu, Search } from "lucide-react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

import { useProducts } from "@/ui/context/ProductContext";
import { useTheme } from "@/ui/context/ThemeContext";
import CartSidebar from "./CartSidebar";
import MenuSelectionSidebarMobile from "./MenuSelectionSidebarMobile";
import MobileProductGroupTabs from "./MobileProductGroupTabs";
import MobileCategoryTab from "./MobileCategoryTab";
import MobileBottomCartBar from "./MobileBottomCartBar";


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
   Sticky Filter Section
========================= */
const MobileStickyFilters = ({
  searchValue,
}: {
  searchValue: string;
}) => {
  return (
    <div className="flex-shrink-0 bg-background ">
      <div className="p-1 space-y-3">
        {/* Product Groups - Only show if no search */}
        {!searchValue.trim() && <MobileProductGroupTabs />}

        {/* Categories - Only show if no search */}
        {!searchValue.trim() && <MobileCategoryTab />}
      </div>
    </div>
  );
};



const MobileView = ({ children }: { children?: ReactNode }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { search, setSearch } = useProducts();
  const { direction } = useTheme();
  const isRTL = direction === "rtl";

  // Handle drag to close menu sidebar
  const handleMenuDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // In RTL, swipe right to close (positive offset); in LTR, swipe left to close (negative offset)
    if (isRTL) {
      if (info.offset.x > 100 || info.velocity.x > 500) {
        setMenuOpen(false);
      }
    } else {
      if (info.offset.x < -100 || info.velocity.x < -500) {
        setMenuOpen(false);
      }
    }
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden flex flex-col safe-area-header safe-area-bottom safe-area-bottom-bg">
      {/* CART SIDEBAR (LEFT) */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* MENU SIDEBAR - Direction aware */}
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
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={isRTL ? { left: 0, right: 0.2 } : { left: 0.2, right: 0 }}
              onDragEnd={handleMenuDragEnd}
              className={`fixed top-0 bottom-0 w-[80%] max-w-[320px] z-50 shadow-2xl bg-background safe-area ${
                isRTL ? "right-0 rounded-l-2xl" : "left-0 rounded-r-2xl"
              }`}
            >
              <MenuSelectionSidebarMobile onClose={() => setMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FIXED HEADER */}
      <MobileHeader
        onOpenMenu={() => setMenuOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* STICKY FILTERS */}
      <MobileStickyFilters searchValue={search} />

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