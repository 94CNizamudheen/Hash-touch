import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/shadcn/components/ui/sheet";
import { Button } from "@/ui/shadcn/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const data = [
  {
    id: 1,
    title: "Order Takeaway",
  },
  {
    id: 2,
    title: "Dine-In",
  },
  {
    id: 3,
    title: "Grab Food",
  },
  {
    id: 4,
    title: "Food Panda",
  },
  {
    id: 5,
    title: "Swiggy",
  },
  {
    id: 6,
    title: "Zomato",
  },
  {
    id: 7,
    title: "Others",
  },
  {
    id: 8,
    title: "Others",
  },
  {
    id: 9,
    title: "Lala Move",
  },
  {
    id: 10,
    title: "Zomato",
  },
];

const ModalDepartment = ({
  isModal,
  onClose,
}: {
  isModal: boolean;
  onClose: () => void;
}) => {
  const [choose, setChoose] = useState(0);
  return (
    <Sheet open={isModal} onOpenChange={onClose}>
      <SheetContent
        side={"left"}
        className="max-h-[90%] sm:max-h-[70%] my-auto rounded-r-2xl px-0 w-full sm:w-auto"
      >
        <SheetHeader className="border-b border-accent px-4 sm:px-5 pb-3 sm:pb-4">
          <SheetTitle className="text-foreground font-semibold text-sm sm:text-base md:text-lg">
            What would you like to do ?
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100%-140px)] sm:h-[80%] mt-6 sm:mt-10 px-4 sm:px-5 overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-3 sm:gap-4 md:gap-5">
            {data.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === choose) {
                    setChoose(0);
                  } else {
                    setChoose(item.id);
                  }
                }}
                className={cn(
                  "col-span-4 sm:col-span-4 md:col-span-6 h-12 sm:h-14 rounded-lg flex items-center justify-center cursor-pointer text-xs sm:text-sm md:text-base font-medium transition-colors",
                  item.id === choose
                    ? "bg-primary text-background"
                    : "bg-accent-foreground text-black hover:bg-accent-foreground/80"
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
        <SheetFooter className="px-4 sm:px-5 flex-col sm:flex-row gap-2 sm:gap-0">
          <SheetClose asChild>
            <Button
              type="button"
              className="bg-accent-foreground text-black dark:text-white w-full sm:w-auto"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button type="button" onClick={() => onClose()} className="w-full sm:w-auto">
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ModalDepartment;