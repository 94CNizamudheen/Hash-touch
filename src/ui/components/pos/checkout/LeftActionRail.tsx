

import {  Home, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppState } from "@/ui/context/AppStateContext";
interface LeftActionRailProps {
  onBackToMenu: () => void;
}

const LeftActionRail = ({ onBackToMenu }: LeftActionRailProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {selectedOrderModeName} = useAppState()

  return (
    <div className="w-36 h-full bg-background border-r border-border flex flex-col items-center  gap-3  ">
      {/* Big action buttons */}
      <button className="w-32 h-68 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center text-center mt-2">
        {t("Discount %")}
      </button>

      <button className="w-32 h-68 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center text-center">
        {t("Item Promotion")}
      </button>

      <button className="w-32 h-68 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center text-center">
        {t("Ticket Promotion")}
      </button>



      {/* Navigation */}
      <button
        onClick={onBackToMenu}
        className="w-32 h-10 rounded-lg bg-secondary text-xs font-medium  "
      >
        {t("Back to Menu")}
      </button>

      <button
        onClick={() => navigate("/pos")}
        className="w-32  h-10 rounded-lg bg-secondary text-xs font-medium flex items-center justify-center gap-1"
      >
        <UtensilsCrossed className="w-4 h-4" /> {t(`${selectedOrderModeName}`)}
      </button>

      <button
        onClick={() => navigate("/pos")}
        className="w-32  h-10 rounded-lg bg-secondary text-xs font-medium flex items-center justify-center gap-1 mb-2"
      >
        <Home className="w-4 h-4" /> {t("Home")}
      </button>
    </div>
  );
};

export default LeftActionRail;
