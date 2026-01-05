
import type { Product } from "@/types/products";
import { Switch } from "@/ui/shadcn/components/ui/switch";

interface SoldOutProductItemProps {
  product: Product;
  isSoldOut: boolean;
  onToggle: () => void;
}

const SoldOutProductItem = ({
  product,
  isSoldOut,
  onToggle,
}: SoldOutProductItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-secondary border border-border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="text-base font-semibold text-foreground truncate">
          {product.name}
        </h3>
      </div>

      <Switch
     checked={isSoldOut}
     onCheckedChange={onToggle}
     className="
       rounded-full
       bg-muted
       shadow-lg
       ring-0
       transition-colors
       data-[state=checked]:bg-red-400
       data-[state=unchecked]:bg-blue-600
     "
/>

    </div>
  );
};

export default SoldOutProductItem;