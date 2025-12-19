import {
  defaultKeysRow1,
  defaultKeysRow2,
  defaultKeysRow3,
  type keysRow1Type,
  type keysRow2Type,
  type keysRow3Type,
} from "../data";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Icons } from "@/ui/icons"; 

const Type4 = ({
  keysRow1,
  keysRow2,
  keysRow3,
  onChangeValue,
  onChangeType,
  value,
  onChangeKeysRow1,
  onChangeKeysRow2,
  onChangeKeysRow3,
}: {
  keysRow1: keysRow1Type;
  keysRow2: keysRow2Type;
  keysRow3: keysRow3Type;
  onChangeValue: (value: string) => void;
  onChangeType: (value: number) => void;
  value: string;
  onChangeKeysRow1: (value: keysRow1Type) => void;
  onChangeKeysRow2: (value: keysRow2Type) => void;
  onChangeKeysRow3: (value: keysRow3Type) => void;
}) => {
  const handleKeyClick = (key: string) => {
    onChangeValue(`${value}${key}`);
  };

  return (
    <div className="flex flex-col space-y-2 p-4 rounded-lg w-full h-full max-w-xl mx-auto">
      {/* First row */}
      <div className="space-x-2 grid grid-cols-7">
        {keysRow1.map((key: string | string[]) => (
          <button
            key={key as string}
            type="button"
            className={cn(
              "relative h-12 rounded-lg bg-white shadow text-black flex justify-center items-center text-lg font-medium",
              !isNaN(Number(key)) ? "col-span-2" : "col-span-1"
            )}
            onClick={() => handleKeyClick(key as string)}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Second row */}
      <div className="grid-cols-7 grid space-x-2">
        {keysRow2.map((key) => (
          <button
            type="button"
            key={key}
            className={cn(
              "h-12 relative rounded-lg bg-white shadow col-span-1 text-black flex justify-center items-center text-lg font-medium",
              !isNaN(Number(key)) ? "col-span-2" : "col-span-1"
            )}
            onClick={() => handleKeyClick(key)}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Third row */}
      <div className="grid-cols-7 grid space-x-2">
        {keysRow3.map((key) => (
          <button
            type="button"
            key={key}
            className={cn(
              "h-12 rounded-lg bg-white shadow text-black col-span-1 flex justify-center items-center text-lg font-medium",
              !isNaN(Number(key)) ? "col-span-2" : "col-span-1"
            )}
            onClick={() => handleKeyClick(key)}
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => onChangeValue(value.slice(0, -1))}
          type="button"
          className="col-span-1 h-12 rounded-lg bg-navigation-foreground text-black shadow flex justify-center items-center text-lg font-medium"
        >
          <Icons.backspace />
        </button>
      </div>

      <div className="grid-cols-7 grid space-x-2">
        <button
          type="button"
          onClick={() => handleKeyClick(".")}
          className="col-span-2 h-12 text-black rounded-lg bg-white shadow flex justify-center items-center text-lg font-medium"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick("0")}
          className="col-span-2 h-12 text-black rounded-lg bg-white shadow flex justify-center items-center text-lg font-medium"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick("00")}
          className="col-span-2 h-12 text-black rounded-lg bg-white shadow flex justify-center items-center text-lg font-medium"
        >
          00
        </button>
        <button
          type="submit"
          className="col-span-1 h-12 rounded-lg bg-primary text-white shadow flex justify-center items-center text-lg font-medium"
        >
          <ArrowRightIcon className="text-white w-5 h-5" />
        </button>
      </div>
      <div className="grid-cols-7 grid space-x-2">
        <button
          type="button"
          onClick={() => {
            onChangeType(1);
            onChangeKeysRow1(defaultKeysRow1);
            onChangeKeysRow2(defaultKeysRow2);
            onChangeKeysRow3(defaultKeysRow3);
          }}
          className="col-span-7 h-12 text-black rounded-lg bg-white shadow flex justify-center items-center text-lg font-medium"
        >
          ABC
        </button>
      </div>
    </div>
  );
};

export default Type4;
