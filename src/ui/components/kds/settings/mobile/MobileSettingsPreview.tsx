
import Right from "../Right";

const MobileSettingsPreview = ({ settings }: any) => {
  return (
    <div className="flex-1 bg-gray-50 p-2 overflow-auto flex justify-center">
      <div className="scale-95">
        <Right settings={settings} />
      </div>
    </div>
  );
};

export default MobileSettingsPreview;
