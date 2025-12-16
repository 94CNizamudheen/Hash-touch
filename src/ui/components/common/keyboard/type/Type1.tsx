/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { charType1KeysRow1, charType1KeysRow2, charType1KeysRow3,type keysRow1Type,type keysRow2Type, type keysRow3Type, numberKeysRow1, numberKeysRow2, numberKeysRow3, } from "../data";
import { cn } from "@/lib/utils";
import data from "@emoji-mart/data";
import { Picker } from 'emoji-mart'
import { ArrowRightIcon, FaceIcon, GlobeIcon } from "@radix-ui/react-icons";
import { Icons } from "@/ui/icons";
const EmojiPicker = Picker as unknown as React.FC<any>;
const Type1 = ({
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
  const [isCaps, setIsCaps] = useState(false);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const handleKeyClick = (key: string) => {
    onChangeValue(`${value}${isCaps ? key.toUpperCase() : key}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        keyboardRef.current &&
        !keyboardRef.current.contains(e.target as Node)
      ) {
        setIsEmojiPickerVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={keyboardRef}
      className="flex flex-col space-y-2 p-4 rounded-lg w-full h-full"
    >
      {/* First row */}
      <div className="space-x-2 grid grid-cols-11">
        {keysRow1.map((key: string[] | string) => (
          <button
            type="button"
            key={key[0] ?? key}
            className={cn(
              "col-span-1 relative h-12 rounded-lg bg-white shadow text-black flex justify-center items-center text-lg font-medium",
              isCaps ? "uppercase" : "lowercase"
            )}
            onClick={() => handleKeyClick(key[0] ?? key)}
          >
            {key[0] ? (
              <>
                {key[0]}
                <p className="absolute top-1 right-1 text-xs text-black">
                  {key[1]}
                </p>
              </>
            ) : (
              key
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChangeValue(value.slice(0, -1))}
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
              "h-12 relative col-span-1 rounded-lg bg-white shadow text-black flex justify-center items-center text-lg font-medium",
              isCaps ? "uppercase" : "lowercase"
            )}
            onClick={() => handleKeyClick(key)}
          >
            {key}
          </button>
        ))}
        <button
          type="submit"
          className="col-span-2 h-12 rounded-lg bg-primary text-white shadow flex justify-center items-center text-lg font-medium"
        >
          <ArrowRightIcon className="text-white w-5 h-5" />
        </button>
      </div>

      {/* Third row */}
      <div className="grid-cols-11 grid space-x-2">
        <button
          type="button"
          onClick={() => setIsCaps(!isCaps)}
          className="col-span-1 h-12 rounded-lg bg-navigation-foreground text-black shadow flex justify-center items-center text-lg font-medium"
        >
          ⇧
        </button>
        {keysRow3.map((key) => (
          <button
            type="button"
            key={key}
            className={cn(
              "col-span-1 h-12 rounded-lg bg-white shadow text-black flex justify-center items-center text-lg font-medium",
              isCaps ? "uppercase" : "lowercase"
            )}
            onClick={() => handleKeyClick(key)}
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIsCaps(!isCaps)}
          className="col-span-1 h-12 rounded-lg bg-navigation-foreground text-black shadow flex justify-center items-center text-lg font-medium"
        >
          ⇧
        </button>
      </div>

      {/* Last row */}
      <div className="grid-cols-11 grid space-x-2">
        <button
          type="button"
          onClick={() => {
            onChangeType(2);
            onChangeKeysRow1(charType1KeysRow1);
            onChangeKeysRow2(charType1KeysRow2);
            onChangeKeysRow3(charType1KeysRow3);
          }}
          className="col-span-1 h-12 text-black rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          ?123
        </button>
        <button
          type="button"
          className="col-span-1 h-12 rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          <GlobeIcon className="text-black w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleKeyClick(" ")}
          className="col-span-6 h-12 rounded-lg bg-white shadow flex justify-center items-center text-lg font-medium"
        />
        <button
          type="button"
          onClick={() => setIsEmojiPickerVisible(true)}
          className="col-span-1 h-12 relative rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          <FaceIcon className="text-black w-5 h-5" />
          {isEmojiPickerVisible && (
            <div className="absolute bottom-0 z-10">
              <EmojiPicker
                data={data}
                onEmojiSelect={(emoji: any) => onChangeValue(`${value}${emoji.native}`)}
              />
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleKeyClick(".")}
          className="col-span-1 h-12 text-black rounded-lg bg-navigation-foreground shadow flex justify-center items-center text-lg font-medium"
        >
          .
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

export default Type1;
