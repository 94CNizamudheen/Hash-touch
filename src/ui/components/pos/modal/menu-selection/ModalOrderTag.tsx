import { Button } from "@/ui/shadcn/components/ui/button";  
import { Input } from "@/ui/shadcn/components/ui/input";  
import { Label } from "@/ui/shadcn/components/ui/label"; 
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/shadcn/components/ui/sheet";
import { SAUCE } from "@/ui/constants/sauce";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ModalOrderTag = ({
  isModal,
  onClose,
  onChangeSauces,
}: {
  isModal: boolean;
  onClose: () => void;
  onChangeSauces: (value: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [isCreateNew, setIsCreateNew] = useState(false);

  if (isCreateNew) {
    return (
      <Sheet open={isCreateNew} onOpenChange={() => setIsCreateNew(false)}>
        <SheetContent className="max-h-[90%] sm:max-h-[70%] my-auto rounded-l-2xl px-0 w-full sm:w-auto">
          <SheetHeader className="border-b border-foreground px-4 sm:px-5 pb-4">
            <SheetTitle className="text-foreground font-semibold text-base sm:text-lg">
              Create New Order Tag
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 sm:mt-10 px-4 sm:px-5 h-[calc(100%-180px)] sm:h-[80%] flex flex-col gap-4 sm:gap-6 overflow-y-auto">
            <div className="flex flex-col gap-2 w-full">
              <Label className="text-sm sm:text-base">Order Tag Name</Label>
              <Input className="h-10 sm:h-11" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label className="text-sm sm:text-base">Order Tag Price</Label>
              <Input className="h-10 sm:h-11" />
            </div>
          </div>
          <SheetFooter className="px-4 sm:px-5 w-full flex-col sm:flex-row gap-2 sm:gap-0">
            <SheetClose asChild>
              <Button
                type="button"
                className="bg-accent-foreground text-foreground w-full sm:w-auto"
              >
                Close
              </Button>
            </SheetClose>
            <Button 
              type="button" 
              onClick={() => onChangeSauces(true)}
              className="w-full sm:w-auto"
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isModal} onOpenChange={onClose}>
      <SheetContent className="max-h-[90%] sm:max-h-[70%] my-auto rounded-l-2xl px-0 w-full sm:w-auto">
        <SheetHeader className="border-b border-accent px-4 sm:px-5 pb-4">
          <SheetTitle className="text-foreground font-semibold text-base sm:text-lg">
            Sauce
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 sm:mt-10 px-4 sm:px-5 h-[calc(100%-180px)] sm:h-[80%] overflow-y-auto">
          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-3 sm:gap-4 md:gap-5">
            {SAUCE.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "h-10 sm:h-10 md:h-10 cursor-pointer rounded-lg col-span-2 sm:col-span-3 md:col-span-4 p-2 flex items-center hover:bg-primary-hover text-foreground justify-center bg-accent-foreground text-xs sm:text-sm"
                )}
              >
                {t(item.title)}
              </div>
            ))}
          </div>
        </div>
        <SheetFooter className="px-4 sm:px-5 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
            <Button 
              onClick={() => setIsCreateNew(true)} 
              type="submit"
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Create New
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
              <SheetClose asChild>
                <Button
                  type="button"
                  className="bg-accent-foreground text-foreground dark:text-white flex-1 sm:flex-none"
                >
                  Remove
                </Button>
              </SheetClose>
              <Button 
                type="button" 
                onClick={() => onChangeSauces(true)}
                className="flex-1 sm:flex-none"
              >
                Save
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ModalOrderTag;