import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import { LAYOUT_NAVIGATION } from "@/constants/menu";

const MobileTableMenu = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating container */}
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center"
        )}
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)", // ensures spacing above nav bar
        }}
      >
        {/* Menu toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center gap-2 w-12 h-12 rounded-full bg-primary text-background shadow-lg active:scale-95 transition-all"
        >
          {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>

        {/* Bottom sheet menu */}
        {isOpen && (
          <div className="absolute bottom-[130%] left-1/2 -translate-x-1/2 w-[90vw] max-w-sm bg-background border border-border rounded-xl shadow-2xl p-3 transition-all duration-300">
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              {LAYOUT_NAVIGATION.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-all",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "bg-navigation text-foreground hover:bg-sidebar-hover"
                  )}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.title ? t(item.title) : t("Home")}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileTableMenu;
