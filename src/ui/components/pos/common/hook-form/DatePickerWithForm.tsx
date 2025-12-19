import { Calendar } from "@ui/shadcn/components/ui/calendar";
import { Button } from "@ui/shadcn/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/shadcn/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
}   from "@ui/shadcn/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

type DatePickerProps = {
  name: string;
  label: string;
};


const DatePickerWithForm = ({ name, label }: DatePickerProps) => {
  const {t}= useTranslation();
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col w-full gap-1">
            <FormLabel className="text-accent font-light">{t(label)}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl className="bg-accent-foreground w-full">
                <Button
                  variant={"outline"}
                  className={cn(
                    "pl-3 text-left font-normal text-black dark:text-white"
                  )}
                >
                  {field.value ? (
                    format(field.value, "d MMMM yyyy")
                  ) : (
                    <span>{t("Pick a date")}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
               
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DatePickerWithForm;
