
import { TextAlignJustifyIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ModalSidebar from "../common/modals/ModalSidebar";
import { useTheme } from "@/ui/context/ThemeContext";
import { cn } from "@/lib/utils";

const MobileMenu = () => {
  const [isModal, setIsModal] = useState(false);
  const { i18n } = useTranslation();
  const { language, setLanguage } = useTheme();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setLanguage(language);
  };

  useEffect(() => {
    changeLanguage(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);


  return (
    <>
      {isModal && (
        <ModalSidebar
          isModal={isModal}
          onClose={() => setIsModal(false)}
          onChangeLang={(value: any) => setLanguage(value)}
          lang={language}
        />
      )}
      <button
        onClick={() => setIsModal(true)}
        className={cn(
          "lg:hidden w-10 h-10 rounded-full bg-primary fixed top-5 flex items-center justify-center shadow-md hover:opacity-90 transition z-50",
          language === "ar" ? "left-3" : "right-3"
        )}
      >
        <TextAlignJustifyIcon className="w-6 h-6 text-background" />
      </button>

    </>
  );
};

export default MobileMenu;
