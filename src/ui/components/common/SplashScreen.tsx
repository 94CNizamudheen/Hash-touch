import { useTheme } from "@/ui/context/ThemeContext";
import Logo from "../../../assets/logo.png";
import LogoDark from "../../../assets/logo_dark.png";
import { Wifi, WifiOff } from "lucide-react";

interface SplashScreenProps {
  type?: number;
  connectionStatus?: "connecting" | "connected" | "failed" | "retrying"|"disconnected";
  syncStatus?: "syncing" | "synced";
  retryCount?: number;
  onRetry?: () => void;
}

const SplashScreen = ({
  type = 1,
  connectionStatus = "connecting",
  syncStatus = "syncing",
  retryCount = 0,
  onRetry
}: SplashScreenProps) => {
  const { theme } = useTheme();

  switch (type) {
    case 1:
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
          <div className="max-w-md mx-auto px-4">
            {theme === "light" ? (
              <img
                src={Logo}
                alt="Logo"
                width={300}
                height={50}
                className="h-auto animate-pulse"
              />
            ) : (
              <img
                src={LogoDark}
                alt="Logo"
                width={300}
                height={50}
                className="h-auto animate-pulse"
              />
            )}
          </div>
        </div>
      );

    case 2:
      return (
        <div className="fixed inset-0 flex items-center justify-center text-center bg-background z-50">
          <div className="flex flex-col gap-10 max-w-md mx-auto px-4">
            {theme === "light" ? (
              <img
                src={Logo}
                alt="Logo"
                width={300}
                height={50}
                className="h-auto animate-pulse"
              />
            ) : (
              <img
                src={LogoDark}
                alt="Logo"
                width={300}
                height={50}
                className="h-auto animate-pulse"
              />
            )}
          </div>
        </div>
      );

    case 3:
      // WebSocket connection screen
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
          <div className="max-w-md mx-auto text-center space-y-6 p-6">
            {/* Logo */}
            {theme === "light" ? (
              <img
                src={Logo}
                alt="Logo"
                width={300}
                height={50}
                className="h-auto mx-auto"
              />
            ) : (
              <img
                src={LogoDark}
                alt="Logo"
                width={300}
                height={50}
                className="h-auto mx-auto"
              />
            )}

            {/* WiFi Icon with status */}
            <div className="flex justify-center">
              {connectionStatus === "failed" ? (
                <div className="relative">
                  <WifiOff className="w-16 h-16 text-destructive" />
                </div>
              ) : (
                <div className="relative">
                  <Wifi className={`w-16 h-16 ${
                    connectionStatus === "connected"
                      ? "text-green-600 dark:text-green-400"
                      : "text-primary animate-pulse"
                  }`} />
                  {connectionStatus === "connecting" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Text */}
            <div className="space-y-2">
              {connectionStatus === "connecting" && (
                <>
                  <h2 className="text-xl font-semibold text-foreground">
                    Connecting to Server
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Establishing WebSocket connection...
                  </p>
                </>
              )}

              {connectionStatus === "retrying" && (
                <>
                  <h2 className="text-xl font-semibold text-foreground">
                    Reconnecting...
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Attempt {retryCount}/5
                  </p>
                </>
              )}

              {connectionStatus === "connected" && (
                <>
                  <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
                    Connected!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Initializing application...
                  </p>
                </>
              )}

              {connectionStatus === "failed" && (
                <>
                  <h2 className="text-xl font-semibold text-destructive">
                    Connection Failed
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unable to connect to WebSocket server
                  </p>
                  <button
                    onClick={onRetry}
                    className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                  >
                    Retry Connection
                  </button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Make sure the server is running on port 9001
                  </p>
                </>
              )}
            </div>

            {/* Loading Dots */}
            {(connectionStatus === "connecting" || connectionStatus === "retrying") && (
              <div className="flex justify-center gap-2 pt-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            )}
          </div>
        </div>
      );

    case 4:
      // Data sync screen
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
          <div className="max-w-md mx-auto text-center space-y-6 p-6">
            {/* Logo */}
            {theme === "light" ? (
              <img
                src={Logo}
                alt="Logo"
                width={300}
                height={50}
                className="h-auto mx-auto"
              />
            ) : (
              <img
                src={LogoDark}
                alt="Logo"
                width={300}
                height={50}
                className="h-auto mx-auto"
              />
            )}

            {/* Status Text */}
            <div className="space-y-2">
              {syncStatus === "syncing" && (
                <>
                  <h2 className="text-xl font-semibold text-foreground">
                    Syncing Data...
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Downloading products, categories, and settings
                  </p>
                </>
              )}

              {syncStatus === "synced" && (
                <>
                  <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
                    Synced Successfully!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    All data is up to date
                  </p>
                </>
              )}
            </div>

            {/* Loading Dots */}
            {syncStatus === "syncing" && (
              <div className="flex justify-center gap-2 pt-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default SplashScreen;
