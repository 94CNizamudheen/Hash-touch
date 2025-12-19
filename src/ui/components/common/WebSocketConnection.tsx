

import { useTheme } from "@/ui/context/theme/useTheme";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import Logo from "@/assets/logo_2.png";
import LogoDark from "@/assets/logo_dark_2.png";

interface WebSocketConnectionProps {
  isConnecting?: boolean;
  hasError?: boolean;
  isConnected?: boolean;
  onRetry?: () => void;
}

const WebSocketConnection = ({
  hasError = false,
  isConnected = false,
  onRetry
}: WebSocketConnectionProps) => {
  const { theme } = useTheme();

  const getTitle = () => {
    if (hasError) return "Connection Failed";
    if (isConnected) return "Connected";
    return "Connecting to Server";
  };

  const getSubtitle = () => {
    if (hasError) return "Unable to establish WebSocket connection";
    if (isConnected) return "Connection established";
    return "Establishing secure connection...";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full px-6">
        <div className="text-center space-y-8">

          {/* LOGO */}
          <div className="flex justify-center">
            <img 
              src={theme === "light" ? Logo : LogoDark} 
              width={200} 
              alt="Logo" 
            />
          </div>

          {/* ICON */}
          <div className="flex justify-center">
            {hasError ? (
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
                  <WifiOff className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </div>
            ) : isConnected ? (
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
                <div className="relative bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
                  <Wifi className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full">
                  <Wifi className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* TEXT */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {getTitle()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {getSubtitle()}
            </p>
          </div>

          {/* BUTTONS */}
          {hasError ? (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          ) : isConnected ? (
            <div className="text-sm text-green-500">Connected successfully.</div>
          ) : (
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300" />
            </div>
          )}

          {/* ERROR DETAILS */}
          {hasError && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                Please check:
              </p>
              <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Network connection is active</li>
                <li>Server is running on port 8080</li>
                <li>Firewall settings allow connection</li>
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WebSocketConnection;

