/**
 * Android WebSocket Foreground Service Bridge
 *
 * This service controls the Android foreground service that keeps
 * the WebSocket server running when the app is in the background.
 *
 * Only available on Android. On other platforms, these methods are no-ops.
 */

// Declare the global interface injected by Android
declare global {
  interface Window {
    WebSocketService?: {
      startService(): boolean;
      stopService(): boolean;
      isServiceRunning(): boolean;
      hasNotificationPermission(): boolean;
    };
  }
}

/**
 * Check if running on Android with the WebSocket service bridge available
 */
export function isAndroidWithWebSocketService(): boolean {
  return typeof window !== "undefined" && !!window.WebSocketService;
}

/**
 * Start the WebSocket foreground service
 * Call this when device is set to POS role on Android
 *
 * @returns true if service started successfully, false otherwise
 */
export function startWebSocketService(): boolean {
  if (!isAndroidWithWebSocketService()) {
    console.log("[WebSocketService] Not on Android, skipping service start");
    return false;
  }

  try {
    const result = window.WebSocketService!.startService();
    console.log("[WebSocketService] Start service result:", result);
    return result;
  } catch (error) {
    console.error("[WebSocketService] Failed to start service:", error);
    return false;
  }
}

/**
 * Stop the WebSocket foreground service
 * Call this when device role changes from POS on Android
 *
 * @returns true if service stopped successfully, false otherwise
 */
export function stopWebSocketService(): boolean {
  if (!isAndroidWithWebSocketService()) {
    console.log("[WebSocketService] Not on Android, skipping service stop");
    return false;
  }

  try {
    const result = window.WebSocketService!.stopService();
    console.log("[WebSocketService] Stop service result:", result);
    return result;
  } catch (error) {
    console.error("[WebSocketService] Failed to stop service:", error);
    return false;
  }
}

/**
 * Check if the WebSocket foreground service is currently running
 *
 * @returns true if service is running, false otherwise
 */
export function isWebSocketServiceRunning(): boolean {
  if (!isAndroidWithWebSocketService()) {
    return false;
  }

  try {
    return window.WebSocketService!.isServiceRunning();
  } catch (error) {
    console.error("[WebSocketService] Failed to check service status:", error);
    return false;
  }
}

/**
 * Check if notification permission is granted (required for foreground service on Android 13+)
 *
 * @returns true if permission is granted, false otherwise
 */
export function hasNotificationPermission(): boolean {
  if (!isAndroidWithWebSocketService()) {
    return true; // Not on Android, permission not needed
  }

  try {
    return window.WebSocketService!.hasNotificationPermission();
  } catch (error) {
    console.error(
      "[WebSocketService] Failed to check notification permission:",
      error
    );
    return false;
  }
}

/**
 * Manage WebSocket service based on device role
 * Call this when device role changes
 *
 * @param role The new device role
 */
export function manageWebSocketServiceForRole(
  role: string | null | undefined
): void {
  if (!isAndroidWithWebSocketService()) {
    return;
  }

  if (role === "POS") {
    console.log("[WebSocketService] POS role detected, starting service");
    startWebSocketService();
  } else {
    // For any other role (KDS, QUEUE, etc.), stop the service if running
    if (isWebSocketServiceRunning()) {
      console.log(
        "[WebSocketService] Non-POS role detected, stopping service"
      );
      stopWebSocketService();
    }
  }
}
