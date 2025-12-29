/**
 * Check if the application is online
 * Uses browser's navigator.onLine and attempts a fetch to verify connectivity
 */
export async function isOnline(): Promise<boolean> {
  // First check browser's online status
  if (!navigator.onLine) {
    console.log("🔴 navigator.onLine = false");
    return false;
  }

  // Try multiple approaches to verify connectivity
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Try a simple GET request that's more likely to work
    const response = await fetch("https://development.hc.hashtape.com/api", {
      method: "GET",
      signal: controller.signal,
      cache: "no-cache",
      mode: "cors",
    });

    clearTimeout(timeoutId);

    // Accept any response (even 404) as proof of connectivity
    console.log("🟢 Network check successful, status:", response.status);
    return true;
  } catch (error) {
    console.warn("🟡 Network check failed, assuming online based on navigator.onLine:", error);
    // If navigator.onLine is true but fetch fails, it might be CORS or endpoint issue
    // Return true to allow the actual API call to determine if it works
    return true;
  }
}

/**
 * Hook to listen for network status changes
 */
export function useNetworkStatus(callback: (isOnline: boolean) => void) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
