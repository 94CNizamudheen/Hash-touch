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

  return (
    <Tabs
      value={selectedCategory}
      onValueChange={(val: string) => setSelectedCategory(val)}
      className="w-full h-full"
    >
      <TabsList
        className={
          direction === "vertical"
            ? "flex flex-col w-full h-auto gap-2 p-0 bg-transparent border-0"
            : "grid grid-cols-4 gap-3 h-auto p-3 bg-background rounded-2xl border border-border shadow-sm"
        }
      >

        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat.value;

          return (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className={`group relative transition-all duration-200
                ${direction === "vertical"
                  ? "flex flex-col items-center justify-center gap-2 p-4 w-full min-h-[100px] rounded-lg border"
                  : "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border overflow-hidden cursor-pointer"
                }
                ${isActive
                  ? "bg-primary text-primary-foreground border-border shadow-md scale-105"
                  : "bg-background text-foreground border-border hover:bg-primary-hover hover:text-background"
                }
              `}
            >
              {/* Image / Initial */}
              {cat.image ? (
                <div
                  className={`relative ${direction === "vertical" ? "w-14 h-14" : "w-10 h-10"
                    } rounded-lg overflow-hidden border transition-all duration-300
                    ${isActive
                      ? "border-border"
                      : "border-border group-hover:border-border"
                    }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`${direction === "vertical" ? "w-14 h-14" : "w-10 h-10"
                    } flex items-center justify-center text-xl font-bold rounded-lg transition-all duration-300
                    ${isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-accent text-accent-foreground group-hover:bg-primary-hover group-hover:text-background"
                    }`}
                >
                  {cat.label.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Label */}
              <span
                className={`font-semibold text-center transition-all duration-300
                  ${direction === "vertical" ? "text-sm" : "text-xs w-full"}
                  ${isActive
                    ? "text-primary-foreground"
                    : "text-foreground group-hover:text-background"
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
