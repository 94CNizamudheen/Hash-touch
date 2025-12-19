import { Card, CardContent} from "@/ui/shadcn/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type{ ReactNode } from "react";

export type CardWithIconProps = {
  title: string;
  link: string;
  icon: ReactNode;
};

const CardWithIcon = ({ title, link, icon }: CardWithIconProps) => {
  const router = useNavigate();
  const { t } = useTranslation();

  return (
    <Card
      onClick={() => router(link)}
      className="bg-card flex flex-col items-center justify-center gap-4 rounded-2xl h-40 sm:h-72 w-full cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="text-primary w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center">
        {icon}
      </div>

      <CardContent className="p-0 flex flex-col items-center justify-center">
        <Link
          to={link}
          className="text-sm sm:text-xl font-semibold text-foreground text-center"
        >
          {t(title)}
        </Link>
      </CardContent>
    </Card>
  );
};

export default CardWithIcon;
