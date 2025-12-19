import { Card, CardContent } from "@/ui/shadcn/components/ui/card";
import { type ReactNode } from "react";

export type CardPaymentProps = {
  icon: ReactNode;
  title: string;
  imgUrl: string;
};

const CardPayment = ({ title, imgUrl, icon }: CardPaymentProps) => {
  return (
    <Card className="w-[100px] h-[70px] flex flex-col items-center justify-center rounded-lg border border-border cursor-pointer bg-white hover:shadow transition-all">
      <CardContent className="p-0 flex flex-col items-center justify-center w-full h-full">
        {/* Image */}
        <div className="flex items-center justify-center w-full h-[36px]">
          <img
            src={imgUrl}
            alt={title}
            className="w-[50px] h-[30px] object-contain"
          />
        </div>

        {/* Label */}
        <div className="flex items-center justify-center gap-1 mt-1">
          {icon}
          <span className="text-xs font-medium text-foreground">{title}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardPayment;
