/**
 * Device Service - Handles device-specific operations
 * Including clearing device data on logout
 */

import { invoke } from "@tauri-apps/api/core";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { kdsSettingsLocal } from "@/services/local/kds-settings.local.service";

export const deviceService = {
  /**
   * Clear all device-specific data
   * Called on logout to reset the device to initial state
   */
  async clearDeviceData(): Promise<void> {
    console.log("[Device Service] Clearing all device data...");

    try {
      // 1. Clear KDS tickets
      try {
        const tickets = await kdsTicketLocal.getAllTickets();
        console.log(`[Device Service] Clearing ${tickets.length} KDS tickets`);

        for (const ticket of tickets) {
          await kdsTicketLocal.deleteTicket(ticket.id);
        }
        console.log("[Device Service] ✅ KDS tickets cleared");
      } catch (error) {
        console.error("[Device Service] ❌ Failed to clear KDS tickets:", error);
      }

      // 2. Reset KDS settings to defaults
      try {
        await kdsSettingsLocal.resetSettings();
        console.log("[Device Service] ✅ KDS settings reset");
      } catch (error) {
        console.error("[Device Service] ❌ Failed to reset KDS settings:", error);
      }

      // 3. Clear app state (device-specific settings)
      try {
        await invoke("clear_app_state");
        console.log("[Device Service] ✅ App state cleared");
      } catch (error) {
        console.error("[Device Service] ❌ Failed to clear app state:", error);
      }

      // 4. Clear localStorage (session data, cart, etc.)
      try {
        // Keep only essential auth-related items if needed
        const keysToRemove = [
          "user_session",
          "user",
          "cart",
          "selected_location",
          "selected_order_mode",
          "kds_settings", // Legacy
          "kds_view_mode", // Legacy
        ];

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
        });
        console.log("[Device Service] ✅ localStorage cleared");
      } catch (error) {
        console.error("[Device Service] ❌ Failed to clear localStorage:", error);
      }

      console.log("[Device Service] ✅ Device data cleared successfully");
    } catch (error) {
      console.error("[Device Service] ❌ Error during device data clearing:", error);
      throw error;
    }
  },

  /**
   * Clear only cart data (for new order scenarios)
   */
  async clearCartData(): Promise<void> {
    try {
      localStorage.removeItem("cart");
      console.log("[Device Service] ✅ Cart data cleared");
    } catch (error) {
      console.error("[Device Service] ❌ Failed to clear cart:", error);
    }
  },

  /**
   * Clear only KDS tickets (for kitchen display reset)
   */
  async clearKdsTickets(): Promise<void> {
    try {
      const tickets = await kdsTicketLocal.getAllTickets();
      for (const ticket of tickets) {
        await kdsTicketLocal.deleteTicket(ticket.id);
      }
      console.log("[Device Service] ✅ KDS tickets cleared");
    } catch (error) {
      console.error("[Device Service] ❌ Failed to clear KDS tickets:", error);
      throw error;
    }
  },
};
