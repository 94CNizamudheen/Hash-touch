import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/ui/shadcn/components/ui/card";
import { Icons } from "@/ui/components/icons";
import SelectFilter from "../../../common/SelectFilter";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React from "react";

export type CardTopProductsProps = {
  link: string;
  products: Products[];
  filterOptions: { value: string; label: string }[];
  filterValue: string;
  onChangeFilterValue: (value: string) => void;
};

type Products = {
  id: string | number;
  imgUrl: string;
  productName: string;
  productDescription?: string;
  totalSold: string;
  totalPrice: string;
};

const CardTopProducts = ({
  link,
  filterOptions,
  filterValue,
  onChangeFilterValue,
  products,
}: CardTopProductsProps) => {
  const { t, i18n: i18next } = useTranslation();

  // Auto-set direction (RTL for Arabic)
  React.useEffect(() => {
    document.body.dir = i18next.language === "ar" ? "rtl" : "ltr";
  }, [i18next.language]);

  return (
    <Card className="w-full bg-card border border-border rounded-2xl shadow-sm h-full">
      <CardHeader className="flex flex-row items-center w-full justify-between p-3 lg:p-6">
        <CardTitle>{t("Top Products")}</CardTitle>
        <SelectFilter
          options={filterOptions}
          value={filterValue}
          OnValueChange={(value) => onChangeFilterValue(value)}
        />
      </CardHeader>

      <CardContent className="flex flex-col gap-1 p-3 lg:p-6">
        {products.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-3xl hover:bg-primary-foreground/10 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.imgUrl}
                alt={t(item.productName)}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex flex-col">
                {/* 🔹 Translate name & description using t() */}
                <h4 className="font-medium text-sm max-w-[200px] break-words lg:max-w-full">
                  {t(item.productName)}
                </h4>
                <p className="font-normal text-accent text-sm max-w-[200px] break-words lg:max-w-full">
                  {item.productDescription ? t(item.productDescription) : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-col text-end">
              <p className="font-bold text-sm">
                {i18next.language === "ar"
                  ? `${t("Sold")} ${item.totalSold}`
                  : `${item.totalSold} ${t("Sold")}`}
              </p>
              <p className="font-semibold text-accent text-sm">
                {i18next.language === "ar"
                  ? `${t("USD")} ${item.totalPrice}`
                  : `${item.totalPrice} ${t("USD")}`}
              </p>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <Link to={link} className="flex items-center gap-1">
          <p className="text-primary text-sm">{t("View all")}</p>
          <Icons.arrowRight className="stroke-primary w-5 h-5" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CardTopProducts;
