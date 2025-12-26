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

const ProductCardMobile = ({
  item,
  onAdd,
}: ProductCardMobileProps) => {
  const { triggerAnimation } = useAnimation();

  const image = getImageFromMedia(item.media);
  const hasImage = image && image !== "";

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
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
      className="
      group bg-background rounded-lg overflow-hidden border border-gray-200 shadow-sm
      cursor-pointer transition-all duration-300
      hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
      flex flex-col
    "
      onClick={handleClick}
    >
      {hasImage && (
        <div
          className="
          relative w-full overflow-hidden bg-gray-100
          h-24 sm:h-28 lg:h-32   /* smaller on mobile, bigger on desktop */
        "
        >
          <img
            src={image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div
        className="
        relative bg-background
        p-2 sm:p-3          /* tighter on mobile */
        min-h-[52px] sm:min-h-[60px]
        flex flex-col justify-between
      "
      >
        <p
          className="
          font-semibold text-xs sm:text-sm lg:text-sm
          text-gray-900 line-clamp-2 mb-1
        "
        >
          {item.name}
        </p>

        <div className="flex items-center justify-end mt-auto">
          <span className="text-blue-600 text-xs sm:text-sm font-bold">
            {item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

};

export default ProductCardMobile;