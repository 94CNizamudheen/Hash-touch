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

export default function CategoryTabs({direction = "horizontal",}: CategoryTabsProps) {
  const {
    groupCategories,
    selectedCategory,
    setSelectedCategory,
    selectedGroup,
  } = useProducts();

    console.log("selected category",selectedCategory)
  const categoriesList = useMemo(() => {
    return groupCategories
      .filter(
        (c) =>
          c.active === 1 &&
          c.product_group_id === selectedGroup
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
      onValueChange={(val: string) =>
        setSelectedCategory(val)
      }
      className="w-full h-full"
    >
      <TabsList
        className={
          direction === "vertical"
            ? "flex flex-col w-full h-auto gap-2 p-0 bg-transparent border-0"
            : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 h-auto p-3 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/50 shadow-sm"
        }
      >
        {categoriesList.map((cat) => (
          <TabsTrigger
            key={cat.value}
            value={cat.value}
            className={`group relative transition-all duration-200 ${direction === "vertical"
                ? "flex flex-col items-center justify-center gap-2 p-4 w-full min-h-[100px] rounded-lg border-2"
                : "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 overflow-hidden cursor-pointer"
              } ${selectedCategory === cat.value
                ? direction === "vertical"
                  ? "bg-pink-50 border-pink-500 shadow-sm"
                  : "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                : direction === "vertical"
                  ? "bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50/30"
                  : "bg-white/80 backdrop-blur-sm border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md"
              }`}
          >
            {/* Image / Initial */}
            {cat.image ? (
              <div
                className={`relative ${direction === "vertical"
                    ? "w-14 h-14"
                    : "w-12 h-12"
                  } rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedCategory === cat.value
                    ? direction === "vertical"
                      ? "border-pink-500"
                      : "border-blue-600"
                    : "border-slate-200 group-hover:border-blue-300"
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
                className={`${direction === "vertical"
                    ? "w-14 h-14"
                    : "w-12 h-12"
                  } flex items-center justify-center text-xl font-bold rounded-lg transition-all duration-300 ${selectedCategory === cat.value
                    ? direction === "vertical"
                      ? "bg-pink-100 text-primary"
                      : "bg-blue-100 text-blue-700"
                    : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 group-hover:from-blue-200 group-hover:to-blue-300"
                  }`}
              >
                {cat.label.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Label */}
            <span
              className={`font-semibold text-center transition-all duration-300 ${direction === "vertical"
                  ? "text-sm"
                  : "text-xs w-full"
                } ${selectedCategory === cat.value
                  ? direction === "vertical"
                    ? "text-primary"
                    : "text-white"
                  : "text-slate-700 group-hover:text-blue-600"
                }`}
            >
              {cat.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
