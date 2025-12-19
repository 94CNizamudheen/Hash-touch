
export {};

declare global {
  interface Window {
    screenType?: "POS" | "KDS" | "KIOSK" | "QUEUE" | "ADMIN";
  }
}
