import { cn } from "@/lib/utils";
import { useProducts } from "@/ui/context/ProductContext";

const MobileProductGroupTabs = () => {
  const {
    productGroups,
    selectedGroup,
    setSelectedGroup,
  } = useProducts();

  if (!productGroups?.length || productGroups.length <= 1) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-3 pb-2">
        {productGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group.id)}
            className={cn(
              "shrink-0 px-3 py-2 rounded-xl text-sm font-semibold transition-all",
              selectedGroup === group.id
                ? "bg-primary text-primary-foreground shadow"
                : "bg-navigation text-foregrpund hover:bg-muted/80"
            )}
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileProductGroupTabs;
