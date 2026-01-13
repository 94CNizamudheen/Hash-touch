


import { invoke } from "@tauri-apps/api/core";

/* =========================
   Types
========================= */

export interface DbSetup {
  id: string;
  code: string;
  name?: string | null;
  setup_type?: string | null;
  channel?: string | null;
  settings?: string | null;

  country_code?: string | null;
  currency_code?: string | null;
  currency_symbol?: string | null;

  active?: number | null;
  sort_order?: number | null;

  created_at?: string | null;
  updated_at?: string | null;
}

/* =========================
   Local Setup Service
========================= */

export const setupLocal = {
  /**
   * Save or update a setup locally (UPSERT)
   */
  save(setup: DbSetup): Promise<void> {
    return invoke("save_setup", { setup });
  },

  /**
   * Get setup by setup code
   */
  getByCode(code: string): Promise<DbSetup | null> {
    return invoke("get_setup_by_code", { code });
  },

  /**
   * Get image URL by media_tag from setup settings
   */
  async getImageByMediaTag(code: string, mediaTag: string): Promise<string | null> {
    try {
      console.log("[setupLocal] 🔍 Getting image for code:", code, "mediaTag:", mediaTag);

      const setup = await this.getByCode(code);
      console.log("[setupLocal] 📦 Setup found:", setup ? "YES" : "NO");

      if (!setup?.settings) {
        console.log("[setupLocal] ⚠️ No settings in setup");
        return null;
      }

      console.log("[setupLocal] 📄 Raw settings:", setup.settings);

      const settings = JSON.parse(setup.settings);
      console.log("[setupLocal] 📋 Parsed settings:", JSON.stringify(settings, null, 2));

      // Try multiple possible structures
      // Structure 1: Array with key "image" containing values
      if (Array.isArray(settings)) {
        console.log("[setupLocal] 🔎 Checking Structure 1: Array with key 'image'");
        const imageSetting = settings.find((s: { key: string }) => s.key === "image");
        console.log("[setupLocal] imageSetting:", imageSetting);
        if (imageSetting?.values) {
          const imageValue = imageSetting.values.find(
            (v: { media_tag: string }) => v.media_tag === mediaTag
          );
          console.log("[setupLocal] imageValue:", imageValue);
          if (imageValue?.defaultValue) {
            console.log("[setupLocal] ✅ Found logo (Structure 1):", imageValue.defaultValue);
            return imageValue.defaultValue;
          }
        }
      }

      // Structure 2: Direct object with media_tag as key
      console.log("[setupLocal] 🔎 Checking Structure 2: Direct key", mediaTag);
      if (settings[mediaTag]) {
        console.log("[setupLocal] ✅ Found logo (Structure 2):", settings[mediaTag]);
        return settings[mediaTag];
      }

      // Structure 3: Nested in images object
      console.log("[setupLocal] 🔎 Checking Structure 3: settings.images[mediaTag]");
      if (settings.images?.[mediaTag]) {
        console.log("[setupLocal] ✅ Found logo (Structure 3):", settings.images[mediaTag]);
        return settings.images[mediaTag];
      }

      // Structure 4: Array of images with media_tag property
      console.log("[setupLocal] 🔎 Checking Structure 4: Array in settings.images");
      if (Array.isArray(settings.images)) {
        const img = settings.images.find((i: any) => i.media_tag === mediaTag);
        console.log("[setupLocal] Found image object:", img);
        if (img?.url || img?.defaultValue) {
          const logoUrl = img.url || img.defaultValue;
          console.log("[setupLocal] ✅ Found logo (Structure 4):", logoUrl);
          return logoUrl;
        }
      }

      console.log("[setupLocal] ❌ Logo not found for media_tag:", mediaTag);
      return null;
    } catch (error) {
      console.error("Failed to get image by media tag:", error);
      return null;
    }
  },
};
