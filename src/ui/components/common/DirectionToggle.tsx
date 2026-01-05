import { useTheme } from "@/ui/context/ThemeContext";
import { cn } from "@/lib/utils";

interface DirectionToggleProps {
  className?: string;
}

export default function DirectionToggle({ className }: DirectionToggleProps) {
  const { direction, setDirection } = useTheme();

  const isRTL = direction === "rtl";

  const handleToggle = () => {
    setDirection(isRTL ? "ltr" : "rtl");
  };

  return (
    <div className={cn("flex items-center justify-center  ", className)}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Switch to ${isRTL ? "LTR" : "RTL"}`}
        className="
          relative w-28 h-6 rounded-full border bg-secondary
          shadow-inner focus:outline-none focus:ring-ring mr-2
        "
      >
        {/* Track labels */}
        <div className="absolute inset-0  flex items-center justify-between px-4 pointer-events-none font-mono">
          <span
            className={cn(
              "text-xs uppercase transition-opacity",
              isRTL ? "opacity-100 text-muted-foreground" : "opacity-40"
            )}
          >
            LTR
          </span>
          <span
            className={cn(
              "text-xs uppercase transition-opacity",
              !isRTL ? "opacity-100 text-muted-foreground" : "opacity-40"
            )}
          >
            RTL
          </span>
        </div>

        {/* Sliding pill */}
        <div
          className={cn(
            "absolute top-0 left-0 h-[100%] w-[calc(50%-4px)] rounded-full bg-primary",
            "flex items-center justify-center text-xs font-mono uppercase",
            "text-primary-foreground shadow-md transition-transform duration-300 ease-in-out",
            isRTL && "translate-x-full"
          )}
        >
          {isRTL ? "RTL" : "LTR"}
        </div>
      </button>
    </div>
  );
}
