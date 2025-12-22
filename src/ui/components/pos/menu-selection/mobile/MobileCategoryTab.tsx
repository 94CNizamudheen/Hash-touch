import { useMemo } from "react";
import { useProducts } from "@/ui/context/ProductContext";

function getImageFromMedia(media?: string) {
  try {
    if (!media) return "";
    const arr = JSON.parse(media);
    return arr?.[0]?.filepath || "";
  } catch {
    return "";
  }
}

const MobileCategoryTab = () => {
  const {
    groupCategories,
    selectedCategory,
    setSelectedCategory,
    selectedGroup,
  } = useProducts();

  const categoriesList = useMemo(() => {
    return groupCategories
      .filter(
        (c) => c.active === 1 && c.product_group_id === selectedGroup
      )
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
        image: getImageFromMedia(cat.media),
      }));
  }, [groupCategories, selectedGroup]);

  if (!categoriesList.length) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-3 pb-2 px-2">
        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat.value;

          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all
                ${
                  isActive
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-80"
                }
              `}
            >
              {/* Image / Initial */}
              <div
                className={`w-16 h-16 rounded-full overflow-hidden border transition-all duration-200
                  ${
                    isActive
                      ? "border-border bg-primary shadow-lg scale-105"
                      : "border-border bg-background shadow-sm hover:bg-primary-hover"
                  }
                `}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      }
                    `}
                  >
                    <span className="text-xl font-bold">
                      {cat.label.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors
                  ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-foreground"
                  }
                `}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileCategoryTab;
