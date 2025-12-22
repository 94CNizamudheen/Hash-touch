

import {  Home, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LeftActionRailProps {
  onBackToMenu: () => void;
}

const LeftActionRail = ({ onBackToMenu }: LeftActionRailProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-[120px] h-full bg-background border-r border-border flex flex-col items-center py-3 gap-3">
      {/* Big action buttons */}
      <button className="w-[90px] h-[120px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center text-center">
        Discount %
      </button>

      <button className="w-[90px] h-[120px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center text-center">
        Item<br />Promotion
      </button>

      <button className="w-[90px] h-[120px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center text-center">
        Ticket<br />Promotion
      </button>

      <div className="flex-1" />

      {/* Navigation */}
      <button
        onClick={onBackToMenu}
        className="w-[90px] h-10 rounded-lg bg-secondary text-xs font-medium"
      >
        Back to Menu
      </button>

      <button
        onClick={() => navigate("/pos")}
        className="w-[90px] h-10 rounded-lg bg-secondary text-xs font-medium flex items-center justify-center gap-1"
      >
        <UtensilsCrossed className="w-4 h-4" /> Dine In
      </button>

      <button
        onClick={() => navigate("/pos")}
        className="w-[90px] h-10 rounded-lg bg-secondary text-xs font-medium flex items-center justify-center gap-1"
      >
        <Home className="w-4 h-4" /> Home
      </button>
    </div>
  );
};

export default LeftActionRail;
