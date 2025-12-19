
import { useEffect, useState } from "react";
import { getScreenType, ScreenType } from "@/utils/screen-type";

export default function useScreenType() {
  const [type, setType] = useState<ScreenType>("UNKNOWN");

  useEffect(() => {
    setType(getScreenType());
  }, []);

  return type;
}
