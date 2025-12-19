import { cn } from "@/lib/utils";
import { useProducts } from "@/ui/context/ProductContext";

export default function ProductGroupTabs() {
  const {
    productGroups,
    selectedGroup,
    setSelectedGroup,
  } = useProducts();

  if (!productGroups?.length) return null;
  console.log("productGroups",productGroups)

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-3 min-w-max">
        {productGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group.id)}
            className={cn(
              "px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition",
              selectedGroup === group.id
                ? "bg-primary text-primary-foreground shadow"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>
  );
}
