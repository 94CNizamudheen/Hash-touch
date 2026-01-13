import { useState } from "react";
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
  type  keysRow2Type,
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

const getInitialKeys = (initKeyboard?: number) => {
  switch (initKeyboard) {
    case 2:
      return {
        row1: charType1KeysRow1,
        row2: charType1KeysRow2,
        row3: charType1KeysRow3,
      };
    case 3:
      return {
        row1: charType2KeysRow1,
        row2: charType2KeysRow2,
        row3: charType2KeysRow3,
      };
    case 4:
      return {
        row1: numberKeysRow1,
        row2: numberKeysRow2,
        row3: numberKeysRow3,
      };
    default:
      return {
        row1: defaultKeysRow1,
        row2: defaultKeysRow2,
        row3: defaultKeysRow3,
      };
  }
};

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
  const initialKeys = getInitialKeys(initKeyboard);
  const [value, setValue] = useState(
    searchParams.get("search") ?? defaultValue
  );
  const [type, setType] = useState(initKeyboard ?? 1);
  const [keysRow1, setKeysRow1] = useState<keysRow1Type>(initialKeys.row1);
  const [keysRow2, setKeysRow2] = useState<keysRow2Type>(initialKeys.row2);
  const [keysRow3, setKeysRow3] = useState<keysRow3Type>(initialKeys.row3);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onChange(newValue);
  };

  switch (type) {
    case 1:
      return (
        <Type1
          onChangeValue={handleValueChange}
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
          onChangeValue={handleValueChange}
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
          onChangeValue={handleValueChange}
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
          onChangeValue={handleValueChange}
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
