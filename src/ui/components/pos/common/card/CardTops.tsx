import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/components/ui/card";
import type { ReactNode } from "react";

export type CardTopsProps = {
  title: string;
  children: ReactNode;
};


const CardTops = ({ children, title }: CardTopsProps) => {
  return (
    <Card className="w-full bg-card border border-border shadow-sm rounded-2xl h-full">
      <CardHeader className="py-4 px-5">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">{children}</CardContent>
    </Card>
  );
};

export default CardTops;