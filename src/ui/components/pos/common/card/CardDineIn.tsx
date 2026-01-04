import { Minus, Plus, Trash2 } from "lucide-react";

interface CardDineInProps {
  menu: string;
  quantity: number;
  price: number;
  modifiers?: { name: string; qty: number; price: number }[];
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onClick?: () => void;
}

const CardDineIn = ({
  menu,
  quantity,
  price,
  modifiers,
  onIncrement,
  onDecrement,
  onRemove,
  onClick,
}: CardDineInProps) => {
  // Note: price already includes base price + modifiers (from CartContext)
  // So we just multiply by quantity
  const totalPrice = quantity * price;
  
  return (
    <div onClick={onClick} className="bg-background border border-border rounded-xl p-4 shadow-sm cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-foreground flex-1">
          {menu}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-foreground">{totalPrice.toFixed(2)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-8 h-8 rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Modifiers List */}
      {modifiers && modifiers.length > 0 && (
        <div className="space-y-1 mb-4">
          {modifiers.map((modifier, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-foreground">
                {modifier.name} x {modifier.qty} @ {modifier.price.toFixed(2)}
              </span>
              <span className="text-foreground font-medium">
                {(modifier.price * modifier.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quantity Controls */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDecrement();
          }}
          className="w-10 h-10 rounded bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-center transition-colors"
        >
          <Minus size={20} strokeWidth={2.5} />
        </button>

        <span className="text-lg font-semibold min-w-[32px] text-center text-foreground">
          {quantity}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onIncrement();
          }}
          className="w-10 h-10 rounded bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-center transition-colors"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default CardDineIn;