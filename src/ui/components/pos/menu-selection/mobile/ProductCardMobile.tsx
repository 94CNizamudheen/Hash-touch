import type { Product } from "@/types/products";
import { useAnimation } from "@/ui/context/AnimationContext";
import tempImage from "@assets/dish-placeholder.jpg"

function getImageFromMedia(media?: string) {
  try {
    if (!media) return tempImage;
    const arr = JSON.parse(media);
    return arr?.[0]?.filepath || tempImage
  } catch {
    return tempImage
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

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const target = e.currentTarget;
    const img = target.querySelector("img");

    if (img) {
      triggerAnimation(img, image);
    }

    setTimeout(() => {
      onAdd(item);
    }, 100);
  };

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
      onClick={handleClick}
    >
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="relative bg-primary text-white p-3 h-20 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="font-bold text-sm line-clamp-1 flex-1 group-hover:text-blue-100 transition-colors">
            {item.name}
          </p>
          <span className=" absolute bottom-2 right-1 flex-shrink-0 bg-white text-primary px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCardMobile;
