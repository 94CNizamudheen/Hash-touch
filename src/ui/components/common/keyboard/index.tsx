import { useEffect, useState } from "react";
import {
  charType1KeysRow1,
  charType1KeysRow2,
  charType1KeysRow3,
  charType2KeysRow1,
  charType2KeysRow2,
  charType2KeysRow3,
  defaultKeysRow1,
  defaultKeysRow2,
  defaultKeysRow3,
  type keysRow1Type,
  type keysRow2Type,
  type keysRow3Type,
  numberKeysRow1,
  numberKeysRow2,
  numberKeysRow3,
} from "./data";
import Type1 from "./type/Type1";
import Type2 from "./type/Type2";
import Type3 from "./type/Type3";
import Type4 from "./type/Type4";
import { useSearchParams } from "react-router-dom";
const Keyboard = ({
  onChange,
  defaultValue,
  initKeyboard,
}: {
  onChange: (value: string) => void;
  defaultValue: string;
  initKeyboard?: number;
}) => {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(
    searchParams.get("search") ?? defaultValue
  );
  const [type, setType] = useState(initKeyboard ?? 1);
  const [keysRow1, setKeysRow1] = useState<keysRow1Type>(defaultKeysRow1);
  const [keysRow2, setKeysRow2] = useState<keysRow2Type>(defaultKeysRow2);
  const [keysRow3, setKeysRow3] = useState<keysRow3Type>(defaultKeysRow3);

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  useEffect(() => {
    onChange(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (initKeyboard) {
      switch (initKeyboard) {
        case 2:
          setKeysRow1(charType1KeysRow1);
          setKeysRow2(charType1KeysRow2);
          setKeysRow3(charType1KeysRow3);
          break;
        case 3:
          setKeysRow1(charType2KeysRow1);
          setKeysRow2(charType2KeysRow2);
          setKeysRow3(charType2KeysRow3);
          break;
        case 4:
          setKeysRow1(numberKeysRow1);
          setKeysRow2(numberKeysRow2);
          setKeysRow3(numberKeysRow3);
          break;
        default:
          break;
      }
    }
  }, [initKeyboard]);

  switch (type) {
    case 1:
      return (
        <Type1
          onChangeValue={(value) => setValue(value)}
          keysRow1={keysRow1}
          keysRow2={keysRow2}
          keysRow3={keysRow3}
          onChangeType={(value) => setType(value)}
          value={value}
          onChangeKeysRow1={(value) => setKeysRow1(value)}
          onChangeKeysRow2={(value) => setKeysRow2(value)}
          onChangeKeysRow3={(value) => setKeysRow3(value)}
        />
      );
    case 2:
      return (
        <Type2
          onChangeValue={(value) => setValue(value)}
          keysRow1={keysRow1}
          keysRow2={keysRow2}
          keysRow3={keysRow3}
          onChangeType={(value) => setType(value)}
          value={value}
          onChangeKeysRow1={(value) => setKeysRow1(value)}
          onChangeKeysRow2={(value) => setKeysRow2(value)}
          onChangeKeysRow3={(value) => setKeysRow3(value)}
        />
      );
    case 3:
      return (
        <Type3
          onChangeValue={(value) => setValue(value)}
          keysRow1={keysRow1}
          keysRow2={keysRow2}
          keysRow3={keysRow3}
          onChangeType={(value) => setType(value)}
          value={value}
          onChangeKeysRow1={(value) => setKeysRow1(value)}
          onChangeKeysRow2={(value) => setKeysRow2(value)}
          onChangeKeysRow3={(value) => setKeysRow3(value)}
        />
      );
    case 4:
      return (
        <Type4
          onChangeValue={(value) => setValue(value)}
          keysRow1={keysRow1}
          keysRow2={keysRow2}
          keysRow3={keysRow3}
          onChangeType={(value) => setType(value)}
          value={value}
          onChangeKeysRow1={(value) => setKeysRow1(value)}
          onChangeKeysRow2={(value) => setKeysRow2(value)}
          onChangeKeysRow3={(value) => setKeysRow3(value)}
        />
      );
    default:
      break;
  }
};

export default Keyboard;
