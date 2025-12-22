import { cn } from "@/lib/utils";
import { useProducts } from "@/ui/context/ProductContext";

export default function ProductGroupTabs() {
  const {
    productGroups,
    selectedGroup,
    setSelectedGroup,
  } = useProducts();

  if (!productGroups?.length) return null;
  console.log("productGroups", productGroups)

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-2 min-w-max">
        {productGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group.id)}
            className={cn(
              "px-10 py-4 rounded text-sm font-semibold whitespace-nowrap transition-all",
              selectedGroup === group.id
                ? "bg-primary text-primary-foreground shadow"
                : "bg-navigation text-foreground hover:bg-blue-500"
            )}
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>
  );
}
