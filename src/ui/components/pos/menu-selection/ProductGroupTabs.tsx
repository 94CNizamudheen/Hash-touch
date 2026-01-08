import { cn } from "@/lib/utils";
import { useProducts } from "@/ui/context/ProductContext";

export default function ProductGroupTabs() {
  const {
    productGroups,
    selectedGroup,
    setSelectedGroup,
  } = useProducts();

  if (!productGroups?.length) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-2 min-w-max">
        {productGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group.id)}
            className={cn(
              "px-10 py-4 rounded-lg border border-border text-sm  whitespace-nowrap transition-all",
              selectedGroup === group.id
                ? "bg-primary text-primary-foreground shadow"
                : "bg-secondary text-foreground hover:bg-primary-hover"
            )}
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>
  );
}
