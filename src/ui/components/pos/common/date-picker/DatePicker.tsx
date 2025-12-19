import { Calendar } from "@ui/shadcn/components/ui/calendar";
import { Label } from "@/ui/shadcn/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/shadcn/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, parse } from "date-fns";
import { useState,  } from "react";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
  label: string;
  defaultValue?: string;     // readable or backend formats
  onChange?: (value: string) => void; // returns backend format yyyy-MM-dd
}

const DatePicker = ({ label, defaultValue, onChange }: DatePickerProps) => {
  const {t}= useTranslation();
  const parseInitial = () => {
    if (!defaultValue) return undefined;

    const tryParse = (value: string, fmt: string) => {
      try {
        const d = parse(value, fmt, new Date());
        return isNaN(d.getTime()) ? undefined : d;
      } catch {
        return undefined;
      }
    };

    return (
      tryParse(defaultValue, "yyyy-MM-dd") ||
      tryParse(defaultValue, "dd-MM-yyyy") ||
      tryParse(defaultValue, "d MMMM yyyy")
    );
  };

  const [date, setDate] = useState<Date | undefined>(parseInitial());
  const [open, setOpen] = useState(false);

  // -----------------------------------------------------
  // 2) Convert date → backend format
  // -----------------------------------------------------
  const handleSelect = (d: Date | undefined) => {
    setDate(d);

    if (onChange && d) {
      const backendFormat = format(d, "yyyy-MM-dd"); // backend-safe
      onChange(backendFormat);
    }

    setOpen(false);
  };

  // -----------------------------------------------------
  // 3) Display value (readable)
  // -----------------------------------------------------
  const displayValue = date ? format(date, "d MMM yyyy") : "Pick a date";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="border-2 bg-background border-input w-full rounded-lg min-h-14 px-3 flex items-center justify-between cursor-pointer hover:border-ring transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          {/* Label + Value */}
          <div className="flex flex-col gap-1">
            <Label className="text-accent text-sm select-none">
              {t(label)}
            </Label>
            <div
              className={cn(
                "text-left font-normal text-foreground text-sm",
                !date && "text-muted-foreground"
              )}
            >
              {displayValue}
            </div>
          </div>

          <CalendarIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </PopoverTrigger>

      {/* Calendar Popover */}
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-[300px] sm:w-[340px] p-4 rounded-xl shadow-md  z-[9999] bg-background"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          defaultMonth={date}
          className="rounded-md w-full"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
