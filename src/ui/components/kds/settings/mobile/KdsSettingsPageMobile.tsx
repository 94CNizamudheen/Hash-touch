import { useState } from "react";
import { useKdsSettings } from "@/ui/context/KdsSettingsContext";
import MobileSettingsTop from "./MobileSettingsTop";
import MobileSettingsLeftSide from "./MobileSettingsLeftSide";
import MobileSettingsPreview from "./MobileSettingsPreview";
import MobileSettingsBottom from "./MobileSettingsBottom";
import type { SectionId } from "./MobileSettingsLeftSide";

const KdsSettingsPageMobile = () => {
  const { settings, updateSettings, resetSettings } = useKdsSettings();

  const [activeSection, setActiveSection] = useState<SectionId>("card");

  return (
    <div className="flex flex-col h-screen bg-white safe-area">
      <MobileSettingsTop onReset={resetSettings} />

      <div className="flex flex-1 overflow-hidden">
        <MobileSettingsLeftSide
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <MobileSettingsPreview settings={settings} />
      </div>

      <MobileSettingsBottom
        activeSection={activeSection}
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
};


export default KdsSettingsPageMobile;
