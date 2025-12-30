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
      className="w-full min-h-0"
    >
      {isVertical ? (
        // Vertical layout
        <TabsList
          style={{ WebkitOverflowScrolling: "touch" }}
          className="gap-2 grid grid-cols-12 auto-rows-max h-full  overflow-y-auto no-scrollbar"
        >
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.value;

            return (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className={`rounded-xl px-8 cursor-pointer flex flex-row gap-2 justify-between border transition-colors col-span-12
                  ${
                    isActive
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-secondary border-border text-foreground hover:bg-primary-hover hover:text-background"
                  }
                `}
              >
                {/* Image */}
                {cat.image ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden ">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg 
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
                <span className={`font-semibold text-sm whitespace-nowrap`}>
                  {cat.label}
                </span>
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
                  className={`flex items-center gap-3 px-8 py-2 border rounded transition-all duration-200 cursor-pointer whitespace-nowrap
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground border-border shadow-md"
                        : "bg-gray-50 text-foreground border-border hover:bg-primary-hover hover:text-background"
                    }
                  `}
                >
                  {/* Image */}
                  {cat.image ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
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
                  <span className="font-semibold text-sm">
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
