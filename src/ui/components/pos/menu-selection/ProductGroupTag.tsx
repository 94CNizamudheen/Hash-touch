import { Card, CardContent } from "@/ui/shadcn/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductGroupTagProps {
  title: string;
  price: number;
  min: number;
  max: number;
  selectedCount: number;
  isSelected?: boolean;
  quantity?: number;
  disabled?: boolean;
  onClick?: () => void;
  onQuantityChange?: (delta: number) => void;
}

export default function ProductGroupTag({
  title,
  price,
  max,
  selectedCount,
  isSelected = false,
  quantity = 0,
  disabled = false,
  onClick,
  onQuantityChange,
}: ProductGroupTagProps) {
  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuantityChange && selectedCount < max) {
      onQuantityChange(1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuantityChange && quantity > 0) {
      onQuantityChange(-1);
    }
  };

  return (
    <Card
      role="button"
      aria-disabled={disabled}
      onClick={!disabled && !isSelected ? onClick : undefined}
      className={cn(
        "cursor-pointer border-2 transition-all duration-200 w-48",
        "min-h-[140px]",
        "bg-secondary",

        // Default state
        !isSelected && "border-border hover:border-tag-hover",

        // Selected state
        isSelected && "border-tag-hover bg-tag-selected",

        // Disabled state
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <CardContent className=" h-full flex flex-col justify-between">
        {/* TOP */}
        <div className="space-y-1">
          <p className="text-foreground font-medium leading-tight text-base">
            {title}
          </p>
          <p className="text-primary font-semibold text-base">
            ${price.toFixed(2)}
          </p>
        </div>

        {/* BOTTOM - Quantity Controls */}
        {isSelected && quantity > 0 && (
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 0}
              className="w-9 h-9 rounded-full bg-destructive hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-destructive-foreground font-bold text-lg flex items-center justify-center transition-colors"
            >
              −
            </button>

            <span className="text-lg font-semibold text-foreground min-w-[2rem] text-center">
              {quantity}
            </span>

            <button
              onClick={handleIncrement}
              disabled={selectedCount >= max}
              className="w-9 h-9 rounded-full bg-success hover:bg-success-hover disabled:opacity-50 disabled:cursor-not-allowed text-success-foreground font-bold text-lg flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}