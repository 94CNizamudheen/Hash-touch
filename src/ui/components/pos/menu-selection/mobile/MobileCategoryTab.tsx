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
      <div className="flex gap-3 pb-1 px-1">
        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat.value;

          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-1.5 transition-all rounded-xl w-20
                ${
                  isActive
                    ? "opacity-100 bg-primary/10"
                    : "opacity-70 hover:opacity-90"
                }
              `}
            >
              {/* Image / Initial */}
              <div
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-200
                  ${
                    isActive
                      ? "border-primary bg-primary shadow-lg scale-105"
                      : "border-border bg-secondary shadow-sm hover:bg-primary-hover"
                  }
                `}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover bg-primary"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center
                      ${
                        isActive
                          ? "bg-primary text-background"
                          : "bg-accent text-accent-foreground"
                      }
                    `}
                  >
                    <span className="text-sm font-bold">
                      {cat.label.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Label with rounded pill background */}
              <div
                className={`w-full overflow-hidden px-2 py-0.5 rounded-full transition-all
                  ${
                    isActive
                      ? "bg-primary"
                      : "bg-secondary"
                  }
                `}
              >
                {cat.label.length > 7 ? (
                  <div className="marquee-container">
                    <span
                      className={`inline-block text-[10px] font-medium whitespace-nowrap 
                        ${
                          isActive
                            ? "text-primary-foreground font-semibold animate-marquee"
                            : "text-foreground"
                        }
                      `}
                    >
                      {cat.label}&nbsp;&nbsp;&nbsp;&nbsp;{cat.label}&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                  </div>
                ) : (
                  <span
                    className={`block text-[10px] font-medium text-center
                      ${
                        isActive
                          ? "text-primary-foreground font-semibold"
                          : "text-foreground"
                      }
                    `}
                  >
                    {cat.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileCategoryTab;
