
import { RefreshCcw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const KDSTicketsFooter = () => {
    const [lastSync, setLastSync] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setLastSync(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <footer className="flex items-center justify-between px-4 py-3 border-t bg-blue-50">
            {/* Left Section */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <RefreshCcw size={18} className="text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">
                        Count: <span className="text-blue-600">5</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Local Database</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Server Database</span>
                </div>

                <span className="text-sm text-gray-700">
                    Last Sync:{" "}
                    <span className="font-semibold text-blue-600">
                        {lastSync.toLocaleTimeString('en-US', { hour12: true })}
                    </span>
                </span>
            </div>

            {/* Right Section */}
            <div className="flex gap-3">
                <button className="border border-gray-300 bg-white rounded-md px-4 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                    Recall Item
                </button>
                <button className="border border-gray-300 bg-white rounded-md px-4 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                    Recall ticket
                </button>
                <button onClick={()=>window.location.reload()} className="bg-blue-600 text-white px-4 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                    <RefreshCcw size={16} /> Refresh
                </button>
            </div>
        </footer>
    );
}

export default KDSTicketsFooter
