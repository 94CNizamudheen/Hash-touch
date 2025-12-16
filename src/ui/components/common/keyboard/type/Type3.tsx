import {
  charType1KeysRow1,
  charType1KeysRow2,
  charType1KeysRow3,
  defaultKeysRow1,
  defaultKeysRow2,
  defaultKeysRow3,
  type keysRow1Type,
  type keysRow2Type,
  type keysRow3Type,
  numberKeysRow1,
  numberKeysRow2,
  numberKeysRow3,
} from "../data";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Icons } from "@/ui/icons";

const Type3 = ({
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
    <div className="flex flex-col space-y-2 p-4 rounded-lg w-full h-full">
      {/* First row */}
      <div className="space-x-2 grid grid-cols-11">
        {keysRow1.map((key: string | string[]) => (
          <button
            key={key as string}
            type="button"
            className={cn(
              "relative h-12 rounded-lg bg-white shadow col-span-1 text-black flex justify-center items-center text-lg font-medium"
            )}
            onClick={() => handleKeyClick(key as string)}
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

      {/* Second row */}
      <div className="grid-cols-11 grid space-x-2">
        {keysRow2.map((key) => (
          <button
            type="button"
            key={key}
            className={cn(
              "h-12 relative rounded-lg bg-white shadow col-span-1 text-black flex justify-center items-center text-lg font-medium"
            )}
            onClick={() => handleKeyClick(key)}
          >
            {key}
          </button>
        ))}
        <button
          type="submit"
          className="col-span-1 h-12 rounded-lg bg-primary text-white shadow flex justify-center items-center text-lg font-medium"
        >
          <ArrowRightIcon className="text-white w-5 h-5" />
        </button>
      </div>

      {/* Third row */}
      <div className="grid-cols-11 grid space-x-2">
        <button
          onClick={() => {
            onChangeType(2);
            onChangeKeysRow1(charType1KeysRow1);
            onChangeKeysRow2(charType1KeysRow2);
            onChangeKeysRow3(charType1KeysRow3);
          }}
          type="button"
          className="col-span-1 h-12 text-black rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          ?123
        </button>
        {keysRow3.map((key) => (
          <button
            type="button"
            key={key}
            className={cn(
              "h-12 rounded-lg bg-white shadow text-black col-span-1 flex justify-center items-center text-lg font-medium"
            )}
            onClick={() => handleKeyClick(key)}
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => {
            onChangeType(2);
            onChangeKeysRow1(charType1KeysRow1);
            onChangeKeysRow2(charType1KeysRow2);
            onChangeKeysRow3(charType1KeysRow3);
          }}
          type="button"
          className="col-span-1 h-12 text-black rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          ?123
        </button>
      </div>

      <div className="grid-cols-11 grid space-x-2">
        <button
          type="button"
          onClick={() => {
            onChangeType(1);
            onChangeKeysRow1(defaultKeysRow1);
            onChangeKeysRow2(defaultKeysRow2);
            onChangeKeysRow3(defaultKeysRow3);
          }}
          className="col-span-1 h-12 text-black rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          ABC
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick("<")}
          className="col-span-1 h-12 text-black rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          {"<"}
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick(" ")}
          className="col-span-7 h-12 rounded-lg bg-white shadow flex justify-center items-center text-lg font-medium"
        />
        <button
          type="button"
          onClick={() => handleKeyClick(">")}
          className="col-span-1 h-12 text-black rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          {">"}
        </button>
        <button
          type="button"
          onClick={() => {
            onChangeType(4);
            onChangeKeysRow1(numberKeysRow1);
            onChangeKeysRow2(numberKeysRow2);
            onChangeKeysRow3(numberKeysRow3);
          }}
          className="col-span-1 h-12 text-black rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          Num
        </button>
      </div>
    </div>
  );
};

export default Type3;
