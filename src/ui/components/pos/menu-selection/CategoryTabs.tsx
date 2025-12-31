import { Tabs, TabsList, TabsTrigger } from "@/ui/shadcn/components/ui/tabs";
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
    <Tabs
      value={selectedCategory}
      onValueChange={(val: string) => setSelectedCategory(val)}
      className="w-full min-h-0 "
    >
      {isVertical ? (
        // Vertical layout
        <TabsList
          className="grid grid-cols-12 gap-3 h-full overflow-y-auto no-scrollbar "
        >
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.value;

            return (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className={`
                    rounded-xl p-2 cursor-pointer  flex flex-row gap-2 items-center w-full min-w-[200px] border transition-colors col-span-12 
                     ${isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-white border-gray-300 text-foreground hover:bg-gray-50"
                  }
                 `}
              >
                {/* Left Image */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Center Text */}
                <p className="flex-1 text-center font-semibold text-sm whitespace-nowrap">
                  {cat.label}
                </p>
              </TabsTrigger>
            );
          })}
        </TabsList>

      ) : (
        // Horizontal layout - using the same pattern as ProductGroupTabs
        <div className="w-full h-[4.5rem] overflow-x-auto no-scrollbar bg-background shadow-sm">
          <div className="flex gap-3 p-3 min-w-max h-full">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.value;

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={` rounded-xl p-2 cursor-pointer w-full flex flex-row gap-2 items-center min-w-[200px] border transition-colors col-span-3 
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
                  <span className="flex-1 text-center font-semibold text-sm">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      )}
    </Tabs>
  );
}
