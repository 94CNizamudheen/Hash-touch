import { useTheme } from "@/ui/context/ThemeContext";
import Logo from "../../../assets/logo_2.png";
import LogoDark from "../../../assets/logo_dark_2.png";
import { Wifi, WifiOff } from "lucide-react";

interface SplashScreenProps {
  type?: number;
  connectionStatus?: "connecting" | "connected" | "failed" | "retrying"|"disconnected";
  retryCount?: number;
  onRetry?: () => void;
}

const SplashScreen = ({
  type = 1,
  connectionStatus = "connecting",
  retryCount = 0,
  onRetry
}: SplashScreenProps) => {
  const { theme } = useTheme();

  switch (type) {
    case 1:
      return (
        <div className="min-h-screen flex relative items-center justify-center max-w-md mx-auto">
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
      );

    case 2:
      return (
        <div className="min-h-screen flex relative items-center justify-center text-center flex-col gap-10">
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
      );

    case 3:
      // WebSocket connection screen
      return (
        <div className="min-h-screen flex relative items-center justify-center bg-background">
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
                      <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
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

    default:
      return null;
  }
};

export default SplashScreen;
