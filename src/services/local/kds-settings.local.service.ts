import { invoke } from "@tauri-apps/api/core";
import type { ThemeSettings } from "@/ui/components/kds/tickets/ticket.types";

// Default settings (matching KdsSettingsContext)
export const defaultKdsSettings: ThemeSettings = {
  cardBgColor: '#ffffff',
  cardBorderRadius: '8px',
  cardShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  headerTextColor: '#ffffff',
  headerFontSize: '18px',
  headerFontWeight: '600',
  elapsedColor0to5: '#f97316',
  elapsedColor5to10: '#ef4444',
  elapsedColor10to15: '#3b82f6',
  elapsedColor15plus: '#7c3aed',
  bodyBgColor: '#fff7ed',
  bodyTextColor: '#1f2937',
  completedCardBg: '#16a34a',
  completedTextColor: '#ffffff',
  itemPendingBg: '#3b82f6',
  itemPendingBorder: '#1e40af',
  itemPendingText: '#ffffff',
  itemCompletedBg: '#16a34a',
  itemCompletedBorder: '#15803d',
  itemCompletedText: '#ffffff',
  itemBorderRadius: '8px',
  itemPadding: '12px',
  itemFontSize: '14px',
  itemFontWeight: '500',
  allCompletedItemPendingBg: '#3b82f6',
  allCompletedItemPendingBorder: '#1e40af',
  buttonBgColor: '#1f2937',
  buttonTextColor: '#ffffff',
  buttonHoverBg: '#111827',
  buttonBorderRadius: '8px',
  buttonFontSize: '14px',
  buttonFontWeight: '600',
  buttonPadding: '12px',
  showAdminId: true,
  showPreparationTime: true,
  autoMarkDone: true,
  primaryColor: 'orange',
  pageGridCols: '4',
  pageGap: '16px',
  pageBgColor: '#f9fafb',
};

export const kdsSettingsLocal = {
  /**
   * Get KDS settings from SQLite app_state table
   */
  async getSettings(): Promise<ThemeSettings> {
    try {
      const settingsJson = await invoke<string>("get_kds_settings");
      const parsed = JSON.parse(settingsJson);

      // Return defaults if empty object
      if (Object.keys(parsed).length === 0) {
        return defaultKdsSettings;
      }

      return parsed;
    } catch (error) {
      console.error("Failed to get KDS settings:", error);
      return defaultKdsSettings;
    }
  },

  /**
   * Save KDS settings to SQLite app_state table
   */
  async saveSettings(settings: ThemeSettings): Promise<void> {
    try {
      const settingsJson = JSON.stringify(settings);
      await invoke("set_kds_settings", { settings: settingsJson });
    } catch (error) {
      console.error("Failed to save KDS settings:", error);
      throw error;
    }
  },

  /**
   * Get KDS view mode from SQLite app_state table
   */
  async getViewMode(): Promise<string> {
    try {
      const mode = await invoke<string>("get_kds_view_mode");
      return mode || "grid";
    } catch (error) {
      console.error("Failed to get KDS view mode:", error);
      return "grid";
    }
  },

  /**
   * Save KDS view mode to SQLite app_state table
   */
  async saveViewMode(mode: string): Promise<void> {
    try {
      await invoke("set_kds_view_mode", { mode });
    } catch (error) {
      console.error("Failed to save KDS view mode:", error);
      throw error;
    }
  },

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<void> {
    try {
      await this.saveSettings(defaultKdsSettings);
      await this.saveViewMode("grid");
    } catch (error) {
      console.error("Failed to reset KDS settings:", error);
      throw error;
    }
  },
};
