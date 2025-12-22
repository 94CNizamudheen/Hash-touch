import { Button } from "@/ui/shadcn/components/ui/button";
import PaymentOptions from "../payment/PaymentOptions";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/ui/context/CartContext"; 

const BoardFooterDineIn = () => {
  const navigate = useNavigate();
  const { items } = useCart(); 

  const handleSettle = () => {
    const total = items.reduce(
      (sum, item) => sum + item.price * (item as any).quantity,
      0
    );


    navigate("/pos/payment-panel", {
      state: { items: items, total },
    });
  };

  return (
    <footer className="w-full shrink-0 border-t border-border bg-background px-4 py-4 flex flex-col gap-3 pb-safe">
      <PaymentOptions />

      <div className="flex gap-3">
        <Button
          onClick={handleSettle}
          className="flex-1 h-10 bg-primary text-background text-sm font-medium rounded-lg"
        >
          Settle
        </Button>
        <Button className="flex-1 h-10 bg-secondary text-foreground text-sm font-medium rounded-lg">
          Close
        </Button>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1 h-10 bg-secondary text-foreground text-sm font-medium rounded-lg">
          Open Till
        </Button>
        <Button className="flex-1 h-10 bg-secondary text-foreground text-sm font-medium rounded-lg">
          Print Last Ticket
        </Button>
      </div>
    </footer>
  );
};

export default BoardFooterDineIn;
