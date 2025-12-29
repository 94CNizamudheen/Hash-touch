
import { Sheet, SheetContent, } from "@ui/shadcn/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import DarkModeSwitch from "../../../common/DarkModeSwitch";
import { useMediaQuery } from "usehooks-ts";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/assets/logo.png";
import LogoDark from "@/assets/logo_dark.png";
import { useTheme } from "@/ui/context/ThemeContext"; 
import { useTranslation } from "react-i18next";
import SelectFilter from "../../../common/SelectFilter";
import { MENU_NAVIGATION } from "@/ui/constants/menu";
// import { deviceService }
import { LogOut, RotateCcw } from "lucide-react";
// import { useDispatch } from "react-redux";
// import { clearUser } from "@/store/slices/authSlice";
// import { can } from "@/utils/permissions";

const ModalSidebar = ({
  isModal,
  onClose,
  onChangeLang,
  lang,
}: {
  isModal: boolean;
  onClose: () => void;
  onChangeLang: (value: string) => void;
  lang: string;
}) => {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const matches = useMediaQuery("(min-width: 1024px)");
  const { t } = useTranslation();
  // const dispatch = useDispatch();


  useEffect(() => {
    if (matches) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);

  const handleResetDevice = async () => {
    if (confirm("Are you sure you want to reset this device?")) {
      try {

        // await deviceService.clearDevices();
        // localStorage.removeItem("user_session");
        // localStorage.removeItem("selectedTerminal");
        // localStorage.removeItem('user');
        // dispatch(clearUser());


        if ("indexedDB" in window) {
          const dbs = await window.indexedDB.databases();
          for (const db of dbs) {
            if (db.name) window.indexedDB.deleteDatabase(db.name);
          }
        }
        window.location.href = "/";
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout ")) {
      localStorage.removeItem("user_session");
      localStorage.removeItem('user');
      // dispatch(clearUser());
      window.location.href = "/select-terminal";
    }
  }

  return (
    <Sheet open={isModal} onOpenChange={onClose}  >
      <SheetContent
        side={lang === "ar" ? "left" : "right"}
        className="!max-w-sm rounded-2xl h-auto mt-5"
      >

        <div className="flex flex-col justify-between h-full  safe-area">
          {/* --- TOP SECTION --- */}
          <div className="flex flex-col items-center gap-10 overflow-y-auto px-4">
            {theme === "light" ? (
              <img
                src={Logo}
                alt="Logo"
                width={180}
                height={90}
                className="h-auto mt-4"
              />
            ) : (
              <img
                src={LogoDark}
                alt="Logo"
                width={180}
                height={90}
                className="h-auto mt-4"
              />
            )}

            <div className="flex flex-col gap-4 w-full">
              {MENU_NAVIGATION.map((item) => (
                  (item.permission) && (
                <Link
                  to={item.href}
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl hover:bg-navigation-foreground p-3 transition-all",
                    pathname === item.href ? "bg-navigation-foreground" : ""
                  )}
                  onClick={onClose}
                >
                  {item.icon}
                  <p className="text-navigation text-base">{t(item.title)}</p>
                </Link>
              )))}
            </div>
          </div>

          {/* --- BOTTOM SECTION --- */}
          <div className="flex flex-col gap-4 w-full px-4 pb-4 border-t border-border pt-4">
            <SelectFilter
              value={lang}
              OnValueChange={(value: any) => onChangeLang(value)}
              options={[
                { value: "en", label: "English" },
                { value: "ar", label: "Arabic" },
              ]}
            />

            <button
              onClick={handleResetDevice}
              className="flex items-center gap-3 p-3 w-full hover:bg-sidebar-hover rounded-2xl text-navigation text-base"
            >
              <RotateCcw className="stroke-navigation w-5 h-5" />
              <p>{t("Reset Device")}</p>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 w-full hover:bg-sidebar-hover rounded-2xl text-navigation text-base"
            >
              <LogOut className="stroke-navigation w-5 h-5 text-destructive" />
              <p>{t("logout")}</p>
            </button>

            <DarkModeSwitch />
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
};

export default ModalSidebar;
