
import Left from "../Left";

const MobileBottomEditingArea = ({
  settings,
  updateSettings,
  activeSection,
}: any) => {
  return (
    <div className="w-full border-t bg-white p-3 overflow-x-auto whitespace-nowrap">
      {/* Render same inputs but only the selected section */}
      <div className="inline-block min-w-[600px]">
        <Left
          settings={settings}
          updateSettings={updateSettings}
          activeSection={activeSection}
          setActiveSection={() => {}}
        />
      </div>
    </div>
  );
};

export default MobileBottomEditingArea;
