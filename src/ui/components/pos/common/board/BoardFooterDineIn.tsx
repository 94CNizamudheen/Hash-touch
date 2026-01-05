import { Button } from "@/ui/shadcn/components/ui/button";
// import PaymentOptions from "../payment/PaymentOptions";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/ui/context/CartContext";
import { useTranslation } from "react-i18next";
import { useCharges } from "@/ui/hooks/useCharges";
import { useState } from "react";
import ClearCartConfirmModal from "../../modal/ClearCartConfirmModal";



const BoardFooterDineIn = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { t } = useTranslation();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSettle = () => {
    const total = items.reduce(
      (sum, item) => sum + item.price * (item as any).quantity,
      0
    );

    navigate("/pos/payment-panel", {
      state: { items: items, total },
    });
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { charges, totalCharges, totalTax } = useCharges(items, total);

  const subtotal = total;
  const grandTotal = subtotal + totalCharges;


  return (
    <>
      <footer className="w-full shrink-0 border-t border-border bg-background px-4 py-4 flex flex-col gap-3 ">
      {/* Totals Section */}
      {items.length > 0 && (
        <div className="shrink-0 bg-background  border-border">
          <div className="px-4 py-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>{t("Sub Total")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {charges.filter(charge => charge.applied).map((charge) => (
              <div key={charge.id} className="flex justify-between text-muted-foreground">
                <span>
                  {charge.name} ({charge.percentage}%)
                </span>
                <span>${charge.amount.toFixed(2)}</span>
              </div>
            ))}

   
            {totalTax > 0 && (
              <div className="flex justify-between font-medium">
                <span>{t("Total Tax")}</span>
                <span>${totalTax.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-sm pt-1 border-t border-border">
              <span>{t("Grand Total")}</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

          </div>
        </div>
      )}
      {/* <PaymentOptions /> */}

      <div className="flex gap-3">
        <Button
          onClick={handleSettle}
          className="flex-1 h-10 bg-primary text-background text-sm font-medium rounded-lg"
        >
          {t("Settle")}
        </Button>
        <Button
          onClick={() => setShowClearConfirm(true)}
          className="flex-1 h-10 bg-secondary text-foreground text-sm font-medium rounded-lg"
        >
          {t("Clear")}
        </Button>
      </div>


      </footer>

      {showClearConfirm && (
        <ClearCartConfirmModal
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClearCart}
        />
      )}
    </>
  );
};

export default BoardFooterDineIn;
