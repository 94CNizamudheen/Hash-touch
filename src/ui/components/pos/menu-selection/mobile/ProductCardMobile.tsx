import type { Product } from "@/types/products";
import { useAnimation } from "@/ui/context/AnimationContext";

function getImageFromMedia(media?: string): string | undefined {
  try {
    if (!media) return undefined;
    const arr = JSON.parse(media);
    return arr?.[0]?.filepath || undefined;
  } catch {
    return undefined;
  }
}

interface ProductCardMobileProps {
  item: Product;
  onAdd: (item: Product) => void;
}

const ProductCardMobile = ({ item, onAdd }: ProductCardMobileProps) => {
  const { triggerAnimation } = useAnimation();

  const image = getImageFromMedia(item.media);
  const hasImage = image && image !== "";
  const isSoldOut = item.is_sold_out === 1;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't allow clicking if sold out
    if (isSoldOut) return;

    if (hasImage) {
      const target = e.currentTarget;
      const img = target.querySelector("img");

      if (img) {
        triggerAnimation(img, image);
      }
    }

    setTimeout(() => {
      onAdd(item);
    }, 100);
  };

  return (
    <div
      className={`
      group bg-background rounded-lg overflow-hidden border border-gray-200 shadow-sm
      transition-all duration-300
      hover:shadow-md hover:-translate-y-0.5
      flex flex-col relative
      ${isSoldOut ? "opacity-75 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"}
    `}
      onClick={handleClick}
    >
      {/* Unavailable Badge */}
      {isSoldOut && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-background/95 backdrop-blur-sm px-2 py-1 rounded shadow-md border border-border transform -rotate-12">
            <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">
              Unavailable
            </span>
          </div>
        </div>
      )}

      {hasImage && (
        <div
          className="
          relative w-full overflow-hidden bg-gray-100
          h-24 sm:h-28 lg:h-32
        "
        >
          <img
            src={image}
            alt={item.name}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isSoldOut ? "grayscale" : "group-hover:scale-110"
            }`}
            loading="lazy"
          />
          {!isSoldOut && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>
      )}

      <div
        className="
        relative bg-background
        p-2 sm:p-3
        min-h-[52px] sm:min-h-[60px]
        flex flex-col justify-between
      "
      >
        <p
          className={`
          font-semibold text-xs sm:text-sm lg:text-sm
          line-clamp-2 mb-1
          ${isSoldOut ? "text-muted-foreground line-through" : "text-gray-900"}
        `}
        >
          {item.name}
        </p>

        <div className="flex items-center justify-end mt-auto">
          <span
            className={`text-xs sm:text-sm font-bold ${
              isSoldOut ? "text-muted-foreground" : "text-blue-600"
            }`}
          >
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Overlay for sold out effect */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-background/20 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default ProductCardMobile;