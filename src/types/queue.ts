

export type QueueStatus = "WAITING" | "CALLED" | "SERVED";

export interface QueueTokenData {
  id: string;
  ticketId: string;
  ticketNumber: string;
  tokenNumber: number;
  status: QueueStatus;
  source?: "POS" | "KDS";
  locationId?: string;
  orderMode?: string;
  createdAt: string;
  calledAt?: string;
  servedAt?: string;
}
