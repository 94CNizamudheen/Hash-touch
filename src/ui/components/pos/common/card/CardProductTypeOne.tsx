import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/components/ui/card";
import { cn } from "@/lib/utils";

export type CardProductTypeOneProps = {
  menu: string;
  background: string;
  imgMenu?: string;
  className?: string;
  onClick?: () => void;
};

const CardProductTypeOne = ({
  menu,
  background,
  imgMenu,
  className,
  onClick,
}: CardProductTypeOneProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn("rounded-xl p-2 cursor-pointer w-full hover:opacity-90 transition-all", className)}
      style={{ background }}
    >
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-white dark:text-black font-medium text-sm truncate">
          {menu}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 px-0 flex justify-center items-center">
        {imgMenu && (
          <img
            src={imgMenu}
            alt={menu}
            className="h-10 w-10 object-cover rounded-md"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CardProductTypeOne;
