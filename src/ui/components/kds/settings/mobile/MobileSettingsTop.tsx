
import { ArrowLeft, RotateCcw, Settings } from "lucide-react";
const MobileSettingsTop = ({ onReset }: { onReset: () => void }) => {
  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Settings className="text-blue-600" size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">KDS Styling</h1>
          <p className="text-xs text-gray-500">Customize your display</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => window.history.back()}
          className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
export default MobileSettingsTop
