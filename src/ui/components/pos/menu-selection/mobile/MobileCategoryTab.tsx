import { useMemo } from "react";
import type { Category } from "@/types/products";

interface MobileCategoryTabProps {
  selected: string;
  onSelect: (cat: string) => void;
  categories: Category[];
}

function getImageFromMedia(media?: string) {
  try {
    if (!media) return "";
    const arr = JSON.parse(media);
    return arr?.[0]?.filepath || "";
  } catch {
    return "";
  }
}

const MobileCategoryTab = ({
  selected,
  onSelect,
  categories,
}: MobileCategoryTabProps) => {

  const categoriesList = useMemo(() => {
    const list = categories
      .filter((c) => c.active === 1)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((cat) => ({
        value: cat.name,
        label: cat.name,
        image: getImageFromMedia(cat.media),
      }));

    return [{ value: "all", label: "All", image: "" }, ...list];
  }, [categories]);

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-3 pb-2">
        {categoriesList.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${
              selected === cat.value
                ? "opacity-100"
                : "opacity-60 hover:opacity-80"
            }`}
          >
            {/* image */}
            <div
              className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                selected === cat.value
                  ? "border-blue-600 shadow-lg scale-105"
                  : "border-gray-300 shadow-sm"
              } bg-gray-100`}
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                  <span className="text-white text-xl font-bold">
                    {cat.label.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* label */}
            <span
              className={`text-xs font-medium ${
                selected === cat.value
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }`}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileCategoryTab;
