import { useRef, useState } from "react";
import type { PaymentEntry } from "./OrderSidebar";
import { Trash2 } from "lucide-react";

interface SwipeablePaymentItemProps {
  payment: PaymentEntry;
  onRemove: (id: string) => void;
  currencyCode: string;
}

export function SwipeablePaymentItem({ payment, onRemove, currencyCode }: SwipeablePaymentItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const translateXRef = useRef(0); // Track current position in ref for closure access
  const isDraggingRef = useRef(false);

  const SWIPE_THRESHOLD = -60; // Pixels to trigger delete reveal
  const DELETE_BUTTON_WIDTH = 80;
  const AUTO_DELETE_THRESHOLD = -120; // Swipe further to auto-delete

  const handleRemove = () => {
    setIsRemoving(true);
    setTranslateX(-300); // Animate out
    setTimeout(() => {
      onRemove(payment.id);
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    const diff = e.touches[0].clientX - startXRef.current;

    // Only allow left swipe (negative values)
    if (diff < 0) {
      const newTranslateX = Math.max(diff, -DELETE_BUTTON_WIDTH - 40);
      translateXRef.current = newTranslateX;
      setTranslateX(newTranslateX);
    } else {
      translateXRef.current = 0;
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    const currentX = translateXRef.current;

    if (currentX <= AUTO_DELETE_THRESHOLD) {
      // Auto delete when swiped far enough
      handleRemove();
    } else if (currentX <= SWIPE_THRESHOLD) {
      // Show delete button
      translateXRef.current = -DELETE_BUTTON_WIDTH;
      setTranslateX(-DELETE_BUTTON_WIDTH);
    } else {
      // Reset position
      translateXRef.current = 0;
      setTranslateX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const diff = e.clientX - startXRef.current;

      if (diff < 0) {
        const newTranslateX = Math.max(diff, -DELETE_BUTTON_WIDTH - 40);
        translateXRef.current = newTranslateX;
        setTranslateX(newTranslateX);
      } else {
        translateXRef.current = 0;
        setTranslateX(0);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      const currentX = translateXRef.current;

      if (currentX <= AUTO_DELETE_THRESHOLD) {
        // Auto delete when swiped far enough
        handleRemove();
      } else if (currentX <= SWIPE_THRESHOLD) {
        translateXRef.current = -DELETE_BUTTON_WIDTH;
        setTranslateX(-DELETE_BUTTON_WIDTH);
      } else {
        translateXRef.current = 0;
        setTranslateX(0);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Reset swipe when clicking elsewhere
  const handleClick = () => {
    if (translateXRef.current < 0 && translateXRef.current > -DELETE_BUTTON_WIDTH) {
      translateXRef.current = 0;
      setTranslateX(0);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl mb-2 transition-all duration-200 ${
        isRemoving ? "opacity-0 max-h-0 mb-0" : "max-h-24"
      }`}
    >
      {/* Delete button (revealed on swipe) */}
      <div
        className="absolute right-0 top-0 bottom-0 w-20 bg-destructive flex items-center justify-center cursor-pointer hover:bg-destructive/90 active:bg-destructive/80"
        onClick={handleRemove}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      {/* Main content */}
      <div
        className={`relative bg-background p-4 select-none ${
          isDragging ? "" : "transition-transform duration-200"
        }`}
        style={{
          transform: `translateX(${translateX}px)`,
          cursor: translateX < 0 ? "grabbing" : "grab"
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="font-semibold text-sm">{payment.paymentMethodName}</div>
          </div>

          <div className="text-right">
            <div className="font-bold text-base">
              {currencyCode} {payment.amount.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(payment.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>

          {/* Swipe indicator */}
          {translateX === 0 && (
            <div className="text-muted-foreground/40">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}