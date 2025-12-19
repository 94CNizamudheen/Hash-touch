import { Button } from "@/ui/shadcn/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
}   from "@/ui/shadcn/components/ui/sheet";
import { Textarea } from "@/ui/shadcn/components/ui/textarea";

const ModalReasonVoid = ({
  isModal,
  onClose,
}: {
  isModal: boolean;
  onClose: () => void;
}) => {
  return (
    <Sheet open={isModal} onOpenChange={onClose}>
      <SheetContent className="max-h-[90%] sm:max-h-[70%] my-auto rounded-l-2xl px-0 w-full sm:w-auto">
        <SheetHeader className="border-b border-black px-4 sm:px-5 pb-3 sm:pb-4">
          <SheetTitle className="text-black font-semibold text-base sm:text-lg">
            Reason / Void
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100%-140px)] sm:h-[80%] mt-6 sm:mt-10 px-4 sm:px-5">
          <Textarea
            className="min-h-[90%] text-sm sm:text-base"
            placeholder="Enter Your Reason..."
          />
        </div>
        <SheetFooter className="px-4 sm:px-5 flex-col sm:flex-row gap-2 sm:gap-0">
          <SheetClose asChild>
            <Button
              type="button"
              className="bg-accent-foreground text-black dark:text-white w-full sm:w-auto"
            >
              Close
            </Button>
          </SheetClose>
          <Button type="submit" className="w-full sm:w-auto">
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ModalReasonVoid;