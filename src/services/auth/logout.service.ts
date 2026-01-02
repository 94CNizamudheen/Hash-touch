import { appStateApi } from "@/services/tauri/appState";

/**
 * Centralized logout service for both POS and KDS devices
 * Clears all database tables and resets app state
 */
export const logoutService = {
  /**
   * Performs complete logout - clears all data and redirects to home
   */
  async logout(): Promise<void> {
    console.log("🔒 Starting logout process...");

    try {
      // Clear ALL database tables using the comprehensive Rust command
      await appStateApi.clearAllData();
      console.log("✅ All data cleared successfully");

      // Small delay to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirect to home (will show device role selection)
      window.location.assign("/");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      throw error;
    }
  },
};
