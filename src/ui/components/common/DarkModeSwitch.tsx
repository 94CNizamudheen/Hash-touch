
import useHasMounted from "../../hooks/useHasMounted";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icons } from "../icons";
import { cn } from "@/lib/utils";
import { useTheme } from "@/ui/context/ThemeContext";

const spring = {
  type: "spring" as const,
  stiffness: 700,
  damping: 30,
};

export default function DarkModeSwitch({ collapse }: { collapse?: boolean }) {
  const { theme, setTheme } = useTheme();
  const hasMounted = useHasMounted();
  const { t } = useTranslation();

  return (
    hasMounted && (
      <div
        className={cn(
          "flex items-center justify-between gap-3 w-full",
          !collapse && "lg:p-3"
        )}
      >
        {!collapse && (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5">
              {theme === "light" ? (
                <Icons.light className="stroke-black" />
              ) : (
                <Icons.dark />
              )}
            </div>
            <label
              htmlFor="dark-mode"
              className="text-body text-xs font-normal"
            >
              {theme === "light" ? t("Light Mode") : t("Dark Mode")}
            </label>
          </div>
        )}
        <div
          onClick={() => {
            const newTheme = theme === "light" ? "dark" : "light";
            console.log("Toggling theme:", theme, "→", newTheme);
            setTheme(newTheme);
          }}

          className={cn(
            "flex rounded-[50px] bg-primary p-[5px] shadow-inner hover:cursor-pointer dark:bg-zinc-700 ",
            theme === "light" && "place-content-end",
            collapse ? "h-auto" : "h-[40px] w-[75px]"
          )}
        >
          <motion.div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-black dark:bg-white"
            layout
            transition={spring}
          >
            <motion.div whileTap={{ rotate: 360 }}>
              {theme === "light" ? (
                <Icons.dark className="w-6 h-6" />
              ) : (
                <Icons.light className="w-6 h-6 stroke-black" />
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  );
}
