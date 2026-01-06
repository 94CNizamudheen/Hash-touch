import type { KdsStatus } from "@/types/kds";

// ticket.types.ts
export interface Ticket {
  id: string;
  orderNumber: string;
  orderMode: string;
  status:KdsStatus
  receivedTime: Date;
  preparationTime: string;
  items: TicketItem[];
  queueNumber:number;
}

export interface TicketItem {
  id: string;
  name: string;
  quantity: number;
  status: 'pending' | 'completed';
  notes: string;
}

export interface ThemeSettings {
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
}