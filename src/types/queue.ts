

export type QueueStatus = "WAITING" | "CALLED" | "SERVED";

export interface QueueTokenData {
  id: string;
  ticket_id: string;
  ticket_number: string;
  token_number: number;
  status: QueueStatus;
  source?: "POS" | "KDS";
  location_id?: string;
  order_mode?: string;
  created_at: string;
  called_at?: string;
  served_at?: string;
}
