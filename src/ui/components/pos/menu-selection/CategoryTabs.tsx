// import { Tabs, TabsList, TabsTrigger } from "@/ui/shadcn/components/ui/tabs";
import { useProducts } from "@/ui/context/ProductContext";
import { useMemo } from "react";
import templateImage from '@assets/template.png'

interface CategoryTabsProps {
  direction?: "horizontal" | "vertical";
}

function getCategoryImage(media?: string) {
  try {
    if (!media) return "";
    const arr = JSON.parse(media);
    return arr?.[0]?.filepath || templateImage;
  } catch {
    return "";
  }
}

export default function CategoryTabs({
  direction = "horizontal",
}: CategoryTabsProps) {
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
        image: getCategoryImage(cat.media),
      }));
  }, [groupCategories, selectedGroup]);

  if (!categoriesList.length) return null;

  const isVertical = direction === "vertical";

  return (
    <>
      {isVertical ? (
        // Vertical layout
        <div className="w-full h-full overflow-y-auto no-scrollbar bg-background">
          <div className="flex flex-col gap-1.5 md:gap-2 p-2 md:p-3">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.value;

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`
                    rounded-lg md:rounded-xl p-1.5 md:p-2 cursor-pointer flex flex-row gap-2 items-center w- max-w-[200px] border transition-colors
                    h-14
                    ${isActive
                      ? "bg-primary font-semibold text-primary-foreground border-primary shadow-md"
                      : "bg-secondary font-medium text-foreground border-border hover:bg-muted active:bg-muted"
                    }
                  `}
                >
                  {/* Left Image */}
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-md md:rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Center Text */}
                  <span className="flex-1 text-center text-xs md:text-sm px-1 line-clamp-2 leading-tight">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Horizontal layout
        <div className="w-full h-[4.5rem] overflow-x-auto no-scrollbar bg-background shadow-sm">
          <div className="flex gap-3 p-3 min-w-max h-full">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.value;

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`
                    rounded-xl p-2 cursor-pointer w-full flex flex-row gap-2 items-center min-w-[200px] border transition-colors
                    ${isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-white text-foreground border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  {/* Image */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Centered text */}
                  <span className="flex-1 text-center text-sm">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}