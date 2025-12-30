import { useState } from "react";
import Left from "./Left";
import Right from "./Right";
import Top from "./Top";
import { useKdsSettings } from "@/ui/context/KdsSettingsContext"; 
import { useMediaQuery } from "usehooks-ts";
import KdsSettingsPageMobile from "./mobile/KdsSettingsPageMobile";

const KdsSettingsPage = () => {
  const { settings, updateSettings, resetSettings } = useKdsSettings();
  const [activeSection, setActiveSection] = useState("card");
  const isDesktop = useMediaQuery("(min-width: 768px)");

   if (!isDesktop) return <KdsSettingsPageMobile />;
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Top onReset={resetSettings} />
      <div className="flex flex-1 border-t overflow-hidden">
        <div className="w-1/2 border-r bg-white overflow-y-auto">
          <Left
            settings={settings}
            updateSettings={updateSettings}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <Right settings={settings} />
        </div>
      </div>
    </div>
  );
};

export default KdsSettingsPage;
