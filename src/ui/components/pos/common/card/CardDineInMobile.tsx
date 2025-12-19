
import { Button } from "@/ui/shadcn/components/ui/button"; 

interface CardDineInMobileProps {
  menu: string;
  quantity: number;
  price: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

const CardDineInMobile = ({
  menu,
  quantity,
  price,
  onIncrement,
  onDecrement,
  onRemove,
}: CardDineInMobileProps) => {
  return (
    <div className="flex justify-between items-center bg-secondary/40 p-3 rounded-lg shadow-sm">
      <div>
        <h4 className="font-medium text-sm text-foreground">{menu}</h4>
        <p className="text-xs text-muted-foreground">
          Qty × {quantity} @ {price.toFixed(2)}
        </p>
        <p className="font-semibold text-sm text-foreground mt-1">
          ${(price * quantity).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="bg-primary text-white px-2 h-7"
          onClick={onDecrement}
        >
          −
        </Button>
        <span className="w-6 text-center text-sm font-medium">{quantity}</span>
        <Button
          variant="default"
          size="sm"
          className="bg-primary text-white px-2 h-7"
          onClick={onIncrement}
        >
          +
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={onRemove}
        >
          ✕
        </Button>
      </div>
    </div>
  );
};

export default CardDineInMobile;
