
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/shadcn/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ModalOrderTag from "../../modal/menu-selection/ModalOrderTag"; 

export type CardProductTypeTwoProps = {
  menu: string;
  titleArabic: string;
  price: string | number;
  onChangeSauces: (value: boolean) => void;
  className?: string;
  onClick?: () => void;
};


const CardProductTypeTwo = ({
  menu,
  titleArabic,
  price,
  onChangeSauces,
  className,
  onClick
}: CardProductTypeTwoProps) => {
  const [isModal, setIsModal] = useState(false);
  return (
    <>
      {isModal && (
        <ModalOrderTag
          isModal={isModal}
          onClose={() => setIsModal(false)}
          onChangeSauces={onChangeSauces}
        />
      )}
      <Card
        onClick={() => {
          if (onClick) onClick();
          else setIsModal(true);
        }}
        className={cn(
          "rounded-xl p-2 bg-primary cursor-pointer",
          className
        )}
      >
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-background dark:text-black font-medium text-sm">
            {menu}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2 px-0">
          <p className="text-background dark:text-black font-medium text-sm">
            {titleArabic}
          </p>
        </CardContent>
        <CardFooter className="pb-0 justify-end px-0">
          <p className="text-background dark:text-black text-sm font-semibold ">
            ${price}
          </p>
        </CardFooter>
      </Card>
    </>
  );
};

export default CardProductTypeTwo;
