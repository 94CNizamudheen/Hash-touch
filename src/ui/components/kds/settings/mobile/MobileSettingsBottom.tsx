
// MobileSettingsBottom.tsx
import { useState } from "react";
import type { SectionId } from "./MobileSettingsLeftSide";
import MobileEditInputs from "./MobileEditInputs";
import { AlignLeft, CheckCircle2, Circle, Clock, Monitor, Palette, RotateCcw, Settings, Sparkles, Square, Type } from "lucide-react";

const editGroups: Record<SectionId, { id: string; label: string; icon: any }[]> = {
  card: [
    { id: "card-border", label: "Border", icon: Square },
    { id: "card-body", label: "Body Colors", icon: Palette },
  ],
  header: [{ id: "header-text", label: "Text Style", icon: Type }],
  items: [
    { id: "items-pending", label: "Pending", icon: Circle },
    { id: "items-completed", label: "Completed", icon: CheckCircle2 },
    { id: "items-typo", label: "Typography", icon: AlignLeft },
  ],
  button: [
    { id: "button-colors", label: "Colors", icon: Palette },
    { id: "button-style", label: "Style", icon: Sparkles },
  ],
  elapsed: [{ id: "elapsed-colors", label: "Colors", icon: Clock }],
  display: [
    { id: "display-options", label: "Options", icon: Settings },
    { id: "display-layout", label: "Layout", icon: Monitor },
  ],
  device:[
    {id:"reset-device",label:"Reset device",icon:RotateCcw}
  ]
};

type MobileSettingsBottomProps = {
  activeSection: SectionId;
  settings: any;
  updateSettings: (next: any) => void;
};

const MobileSettingsBottom = ({
  activeSection,
  settings,
  updateSettings,
}: MobileSettingsBottomProps) => {
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const groups = editGroups[activeSection];

  if (activeEditId && !groups.some((g) => g.id === activeEditId)) {
    setTimeout(() => setActiveEditId(null), 0);
  }

  return (
    <div className="border-t border-gray-200 bg-white shadow-lg">
      {activeEditId && (
        <div className="max-h-52 overflow-y-auto px-4 pt-3 pb-4 border-b border-gray-100 bg-gray-50">
          <MobileEditInputs
            section={activeSection}
            editId={activeEditId}
            settings={settings}
            updateSettings={updateSettings}
          />
        </div>
      )}

      <div className="w-full px-3 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {groups.map((g) => {
            const Icon = g.icon;
            const isActive = activeEditId === g.id;
            
            return (
              <button
                key={g.id}
                onClick={() => setActiveEditId((prev) => (prev === g.id ? null : g.id))}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold border-2 transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50"
                }`}
              >
                <Icon size={14} strokeWidth={2.5} />
                {g.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileSettingsBottom;
