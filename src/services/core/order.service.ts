/**
 * Order Service - Stub implementation
 * TODO: Implement full order service with API integration
 */

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: Array<{ name: string; price: number }>;
  notes?: string;
}

export const orderService = {
  /**
   * List all items for a given order
   * @param orderId - The order ID
   * @returns Promise<OrderItem[]>
   */
  async listOrderItems(orderId: string): Promise<OrderItem[]> {
    console.log(`[Order Service] Fetching items for order: ${orderId}`);

    // TODO: Implement actual API call or local database query
    // For now, return empty array as stub
    return [];
  },
};
