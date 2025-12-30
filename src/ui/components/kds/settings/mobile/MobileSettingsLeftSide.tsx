import { CheckSquare, Clock, Monitor, MousePointer, RectangleHorizontal, Smartphone, Type } from "lucide-react";

const sectionIcons = {
  card: RectangleHorizontal,
  header: Type,
  items: CheckSquare,
  button: MousePointer,
  elapsed: Clock,
  display: Monitor,
  device: Smartphone,

};

const sections = [
  { id: "card", label: "Card" },
  { id: "header", label: "Header" },
  { id: "items", label: "Items" },
  { id: "button", label: "Button" },
  { id: "elapsed", label: "Elapsed" },
  { id: "display", label: "Display" },
  { id: "device", label: "Device" },
] as const;

type SectionId = (typeof sections)[number]["id"];

const MobileSettingsLeftSide = ({
  activeSection,
  setActiveSection,
}: {
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
}) => {
  return (
    <div className="w-20 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 p-2 overflow-y-auto">
      <div className="flex flex-col gap-2">
        {sections.map((s) => {
          const Icon = sectionIcons[s.id];
          const isActive = activeSection === s.id;
          
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] leading-tight font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileSettingsLeftSide;
export type { SectionId };
