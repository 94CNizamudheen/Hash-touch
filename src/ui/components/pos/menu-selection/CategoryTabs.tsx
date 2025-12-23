import { Tabs, TabsList, TabsTrigger } from "@/ui/shadcn/components/ui/tabs";
import { useProducts } from "@/ui/context/ProductContext";
import { useMemo } from "react";

interface CategoryTabsProps {
  direction?: "horizontal" | "vertical";
}

function getCategoryImage(media?: string) {
  try {
    if (!media) return "";
    const arr = JSON.parse(media);
    return arr?.[0]?.filepath || "";
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
    <Tabs
      value={selectedCategory}
      onValueChange={(val: string) => setSelectedCategory(val)}
      className="w-full min-h-0"
    >
      <TabsList
        style={{ WebkitOverflowScrolling: "touch" }}
        className={`
          ${isVertical ? "flex flex-col" : "flex flex-row"}
          gap-3 p-3
          bg-background   shadow-sm
          ${isVertical ? "h-[14rem] overflow-y-auto overflow-x-hidden" : "h-[5.5rem] overflow-x-auto overflow-y-hidden"}
          overscroll-contain no-scrollbar 
        `}
      >
        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat.value;

          return (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className={`shrink-0 flex items-center gap-3 px-4 py-2
                border transition-all duration-200 cursor-pointer
                ${isVertical ? "w-full" : "min-w-[180px]"}
                ${
                  isActive
                    ? "bg-primary text-primary-foreground border-border shadow-md"
                    : "bg-navigation text-foreground border-border hover:bg-primary-hover hover:text-background"
                }
              `}
            >
              {/* Image */}
              {cat.image ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden  flex-shrink-0">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg flex-shrink-0
                    ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                >
                  {cat.label.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name */}
              <span
                className={`font-semibold text-sm whitespace-nowrap
                  ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }
                `}
              >
                {cat.label}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
