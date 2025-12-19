
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/shadcn/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/shadcn/components/ui/select";
import { useFormContext } from "react-hook-form";

 type SelectProps = {
  name: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
};


const SelectWithForm = ({ name, label, options }: SelectProps) => {
  const form = useFormContext();
  console.log(options);
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full  flex flex-col gap-1">
          <FormLabel className="text-accent font-light">{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="bg-accent-foreground w-full text-black dark:text-white">
                <SelectValue  />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-background">
              {options.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectWithForm;
