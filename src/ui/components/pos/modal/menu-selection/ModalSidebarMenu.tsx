
import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Sheet,SheetContent,SheetTitle, } from "@/ui/shadcn/components/ui/sheet";

const ModalSidebarMenu = ({
  isModal,
  onClose,
  isRTL,
}: {
  isModal: boolean;
  onClose: () => void;
  isRTL: boolean;
}) => {
  return (
    <Sheet open={isModal} onOpenChange={onClose}>
      <SheetContent side={isRTL ? "left" : "right"}>
        <SheetTitle></SheetTitle>
        <div className="flex flex-col justify-between h-full pt-10">
          <div className="flex flex-col gap-3">
            {MENUSELECTIONNAVIGATION.map(
              (item) =>
                item.position === "Top" && (
                  <div
                    key={item.id}
                    className="flex items-center md:justify-center lg:justify-start gap-2 p-1 xl:p-3  rounded-lg cursor-pointer"
                  >
                    {item.icon}
                    <p className={cn("text-navigation font-medium text-base")}>
                      {item.title}
                    </p>
                  </div>
                )
            )}
          </div>
          <div className="flex flex-col gap-3">
            {MENUSELECTIONNAVIGATION.map(
              (item) =>
                item.position === "Bottom" && (
                  <Link
                    to={item.link ?? "#"}
                    key={item.id}
                    className="flex items-center md:justify-center lg:justify-start gap-2 p-1 xl:p-3  rounded-lg cursor-pointer"
                  >
                    {item?.icon}
                    <p className={cn("text-body font-medium text-base")}>
                      {item.title}
                    </p>
                  </Link>
                )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModalSidebarMenu;
