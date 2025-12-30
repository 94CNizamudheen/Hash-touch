import { Minus, Plus, Trash2 } from "lucide-react";

interface CardDineInProps {
  menu: string;
  quantity: number;
  price: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

const CardDineIn = ({
  menu,
  quantity,
  price,
  onIncrement,
  onDecrement,
  onRemove,
}: CardDineInProps) => {
  const totalPrice = quantity * price;
  
  return (
    <div className="bg-secondary rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className=" font-semibold">{menu}</h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold">${totalPrice.toFixed(2)}</span>
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      

      <div className="flex items-center justify-end gap-1 ">
        <button
          onClick={onDecrement}
          className="w-6 h-6 rounded bg-primary hover:bg-primary-hover text-background flex items-center justify-center font-bold text-lg"
        >
          <Minus size={16} />
        </button>
        <span className="text-lg font-semibold min-w-[24px] text-center text-foreground">
          {quantity}
        </span>
        <button
          onClick={onIncrement}
          className="w-6 h-6 rounded bg-primary hover:bg-primary-hover text-background flex items-center justify-center font-bold text-lg"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default CardDineIn;
