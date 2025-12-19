import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/shadcn/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export type SelectFilterProps = {
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  OnValueChange: (value: string) => void;
  className?: string;
};

const SelectFilter = ({
  options,
  value,
  OnValueChange,
  className,
}: SelectFilterProps) => {
  const [filterValue, setFilterValue] = useState(value);
  const { t } = useTranslation();

  return (
    <Select
      value={filterValue}
      onValueChange={(value: string) => {
        setFilterValue(value);
        OnValueChange(value);
      }}
    >
      <SelectTrigger
        className={cn(
          "w-[140px] rounded-lg border border-border bg-background text-foreground",
          className
        )}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent
        className="rounded-xl border border-border bg-background text-foreground shadow-md "
      >
        {options.map((item: any) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className="hover:bg-primary cursor-pointer"
          >
            {t(item.label)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectFilter;
