import { ArrowLeft, Home, UtensilsCrossed, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface OrderSidebarProps {
  items: { id: string; name: string; quantity: number; price: number }[];
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu: () => void;
}

export default function OrderSidebar({
  items,
  total,
  isOpen,
  onClose,
  onBackToMenu,
}: OrderSidebarProps) {
  const { t } = useTranslation();
  const isMobileOverlay = isOpen && window.innerWidth < 1024;
  const router= useNavigate()
  return (
    <div
      className={`${
        isMobileOverlay ? "fixed inset-0 z-50 bg-black/40 flex" : "h-screen"
      }`}
      onClick={(e) => {
        if (isMobileOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rounded-r-2xl h-[95%] w-80 bg-background text-foreground flex flex-col  border-r border-border shadow-md transition-colors safe-area">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <h2 className="text-base font-semibold">{t("order_summary")}</h2>
          {isMobileOverlay && (
            <button
              onClick={onClose}
              className="hover:bg-secondary p-2 rounded-[var(--radius)] transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 no-scrollbar">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-secondary/40 rounded-[var(--radius)] p-3 flex justify-between items-center border border-border hover:bg-secondary/60 transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </div>
                </div>
                <span className="font-semibold text-sm">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              {t("no_items_in_order")}
            </div>
          )}
        </div>

        {/* Discount / Voucher Buttons */}
        <div className="p-4 border-t border-border space-y-2 bg-secondary/20">
          <button className="w-full bg-secondary hover:bg-primary-hover text-foreground font-medium text-sm rounded-[var(--radius)] py-2.5 transition-colors">
            {t("discount_percent")}
          </button>
          <button className="w-full bg-secondary hover:bg-primary-hover text-foreground font-medium text-sm rounded-[var(--radius)] py-2.5 transition-colors">
            {t("promotion")}
          </button>
          <button className="w-full bg-secondary hover:bg-primary-hover text-foreground font-medium text-sm rounded-[var(--radius)] py-2.5 transition-colors">
            {t("voucher")}
          </button>
        </div>

        {/* Total */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex justify-between font-semibold text-base">
            <span>{t("total")}</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-border space-y-2 bg-secondary/20">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t("back_to_menu")}</span>
          </button>
          <button onClick={()=>router('/dashboard')} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors w-full">
            <Home className="w-4 h-4" />
            <span className="text-sm">{t("home")}</span>
          </button>
          <button onClick={()=>router('/pos/table-layout')} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors w-full">
            <UtensilsCrossed className="w-4 h-4" />
            <span className="text-sm">{t("dine_in")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
