
import { Badge } from "@/ui/shadcn/components/ui/badge";
import { useSearchParams } from "react-router-dom";

const HeaderDineIn = () => {
  const [searchParams] = useSearchParams();

  return (
    <div className="p-3 flex gap-1 flex-col">
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-body text-base">Dine In</h4>
        <div className="font-medium text-body text-base">{">"}</div>
        <div className="flex gap-2">
          <h4 className="font-medium text-body text-base">
            Table {searchParams.get("table")}
          </h4>
          <Badge className="rounded-full bg-border text-black dark:text-black font-medium hover:bg-accent-foreground">
            20:33
          </Badge>
        </div>
      </div>
      <p className="text-body text-sm">Status: New Order</p>
    </div>
  );
};

export default HeaderDineIn;
