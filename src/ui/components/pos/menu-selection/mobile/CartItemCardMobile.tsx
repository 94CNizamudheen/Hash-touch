import { Minus, Plus, Trash2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSetup } from "@/ui/context/SetupContext";

interface CartItemCardMobileProps {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
  modifiers?: { name: string; qty: number; price: number }[];
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onClick?: () => void;
}

const CartItemCardMobile = ({
  name,
  quantity,
  price,
  modifiers,
  onIncrement,
  onDecrement,
  onRemove,
  onClick,
}: CartItemCardMobileProps) => {
  const { currencySymbol } = useSetup();
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const DELETE_THRESHOLD = -80;

  const totalPrice = quantity * price;
  const modifiersTotal = modifiers?.reduce((sum, m) => sum + m.price * m.qty, 0) || 0;
  const lineTotal = totalPrice + (modifiersTotal * quantity);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX - translateX);
  };

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const newTranslateX = clientX - startX;
    if (newTranslateX <= 0) {
      setTranslateX(Math.max(newTranslateX, DELETE_THRESHOLD * 1.5));
    }
  }, [isDragging, startX, DELETE_THRESHOLD]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    if (translateX < DELETE_THRESHOLD) {
      setTranslateX(DELETE_THRESHOLD * 2);
      setTimeout(() => {
        onRemove();
      }, 200);
    } else {
      setTranslateX(0);
    }
  }, [translateX, onRemove,DELETE_THRESHOLD]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete Background */}
      <div className="absolute inset-0 bg-destructive flex items-center justify-end pr-6 rounded-xl">
        <Trash2 className="w-6 h-6 text-destructive-foreground" />
      </div>

      {/* Card Content */}
      <div
        ref={cardRef}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onClick={() => {
          if (Math.abs(translateX) < 5) {
            onClick?.();
          }
        }}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        className="bg-secondary rounded-xl p-3 shadow-sm cursor-pointer touch-none"
      >
        <div className="flex gap-3">
          

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Price Row */}
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 flex-1">
                {name}
              </h3>
              <span className="text-sm font-bold text-primary flex-shrink-0">
                {currencySymbol} {lineTotal.toFixed(2)}
              </span>
            </div>

            {/* Modifiers */}
            {modifiers && modifiers.length > 0 && (
              <div className="mb-2">
                {modifiers.slice(0, 2).map((mod, idx) => (
                  <p key={idx} className="text-[10px] text-muted-foreground truncate">
                    + {mod.name} x{mod.qty}
                  </p>
                ))}
                {modifiers.length > 2 && (
                  <p className="text-[10px] text-muted-foreground">
                    +{modifiers.length - 2} more
                  </p>
                )}
              </div>
            )}

            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currencySymbol} {price.toFixed(2)} each
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecrement();
                  }}
                  className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/20 text-background flex items-center justify-center transition-colors active:scale-95"
                >
                  <Minus className="w-4 h-4" strokeWidth={2.5} />
                </button>

                <span className="text-base font-bold min-w-[28px] text-center text-foreground">
                  {quantity}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onIncrement();
                  }}
                  className="w-8 h-8 rounded-lg bg-primary text-background flex items-center justify-center transition-colors active:scale-95"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCardMobile;
