
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/shadcn/components/ui/dropdown-menu";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useState } from "react";

const categories = ["Appetizers", "Soups", "Sushi", "Cakes", "Desserts", "All"];

const MobileCategoryTab = () => {
  const [selected, setSelected] = useState("All");

  return (
    <div className="w-full flex items-center justify-between gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex justify-between items-center rounded-lg border text-sm font-medium"
          >
            {selected}
            <span className="text-xs text-muted-foreground">▼</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-full bg-background hover:bg-primary">
          {categories.map((cat) => (
            <DropdownMenuItem
              key={cat}
              onClick={() => setSelected(cat)}
              className="cursor-pointer"
            >
              {cat}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileCategoryTab;
