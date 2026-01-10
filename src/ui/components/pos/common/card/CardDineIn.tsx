import { Minus, Plus, Trash2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

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
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const DELETE_THRESHOLD = -100; // Swipe 100px left to delete


  const totalPrice = quantity * price;

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX - translateX);
  };

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const newTranslateX = clientX - startX;
    // Only allow left swipe (negative values)
    if (newTranslateX <= 0) {
      setTranslateX(Math.max(newTranslateX, DELETE_THRESHOLD * 1.5));
    }
  }, [isDragging, startX, DELETE_THRESHOLD]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    if (translateX < DELETE_THRESHOLD) {
      // Trigger delete animation and callback
      setTranslateX(DELETE_THRESHOLD * 2);
      setTimeout(() => {
        onRemove();
      }, 200);
    } else {
      // Reset position
      setTranslateX(0);
    }
  }, [translateX, DELETE_THRESHOLD, onRemove]);

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
    <div className="relative overflow-hidden rounded-lg md:rounded-xl">
      {/* Delete Background */}
      <div className="absolute inset-0 bg-destructive flex items-center justify-end pr-4 md:pr-6 rounded-lg md:rounded-xl">
        <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-destructive-foreground" />
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
        className="bg-secondary border border-border rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-sm cursor-pointer touch-none"
      >
        <div className="flex justify-between items-start mb-2 md:mb-3 gap-2">
          <h3 className="text-sm md:text-base text-foreground flex-1 line-clamp-2 leading-tight">
            {menu}
          </h3>
          <span className="font-bold text-sm md:text-lg text-foreground flex-shrink-0">
            {totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Modifiers List */}
        {modifiers && modifiers.length > 0 && (
          <div className="space-y-0.5 md:space-y-1 mb-2 md:mb-4">
            {modifiers.map((modifier, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs md:text-sm gap-2">
                <span className="text-muted-foreground truncate">
                  {modifier.name} x {modifier.qty} @ {modifier.price.toFixed(2)}
                </span>
                <span className="text-foreground font-medium flex-shrink-0">
                  {(modifier.price * modifier.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDecrement();
            }}
            className="w-7 h-7 md:w-8 md:h-8 rounded ltr:rounded-l-lg ltr:md:rounded-l-xl rtl:rounded-r-lg rtl:md:rounded-r-xl bg-primary hover:bg-primary-hover active:bg-primary-hover text-primary-foreground flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
          </button>

          <span className="text-sm md:text-lg font-semibold min-w-[20px] text-center text-foreground">
            {quantity}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onIncrement();
            }}
            className="w-7 h-7 md:w-8 md:h-8 rounded ltr:rounded-r-lg ltr:md:rounded-r-xl rtl:rounded-l-lg rtl:md:rounded-l-xl bg-primary hover:bg-primary-hover active:bg-primary-hover text-primary-foreground flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardDineIn;