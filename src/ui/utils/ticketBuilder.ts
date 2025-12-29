import type { CartItem } from "@/types/cart";
import type { CalculatedCharge } from "@/ui/hooks/useCharges";
import type { TicketRequest, Order, Payment, Transaction } from "@/types/ticket";

interface BuildTicketParams {
  items: CartItem[];
  charges: CalculatedCharge[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  tenderedAmount: number;
  locationId: string;
  locationName: string;
  orderModeName: string;
  channelName: string;
  userName?: string;
}

function getCurrentDateTime() {
  const now = new Date();
  return {
    date: now.toISOString().split("T")[0], // YYYY-MM-DD
    time: now.toTimeString().split(" ")[0], // HH:MM:SS
    datetime: now.toISOString(), // Full ISO datetime
  };
}

function generateTicketNumber(): number {
  // Generate a unique ticket number based on timestamp
  return parseInt(Date.now().toString().slice(-8));
}

function generateInvoiceNumber(): string {
  // Generate invoice number with prefix
  const timestamp = Date.now();
  return `INV-${timestamp}`;
}

export function buildTicketRequest(params: BuildTicketParams): TicketRequest {
  const {
    items,
    charges,
    subtotal,
    total,
    paymentMethod,
    tenderedAmount,
    locationId,
    locationName,
    orderModeName,
    channelName,
    userName = "POS User",
  } = params;

  const { date, time, datetime } = getCurrentDateTime();
  const ticketNumber = generateTicketNumber();
  const invoiceNumber = generateInvoiceNumber();

  // Calculate total tax from charges
  const totalTax = charges
    .filter((c) => c.is_tax)
    .reduce((sum, c) => sum + c.amount, 0);

  // Calculate total charges (non-tax)
  const totalCharges = charges
    .filter((c) => !c.is_tax)
    .reduce((sum, c) => sum + c.amount, 0);

  // Build tax detail object
  const taxDetail: Record<string, any> = {};
  charges
    .filter((c) => c.is_tax)
    .forEach((charge) => {
      taxDetail[charge.name] = {
        percentage: charge.percentage,
        amount: charge.amount.toFixed(2),
      };
    });

  // Build charge details object
  const chargeDetails: Record<string, any> = {};
  charges
    .filter((c) => !c.is_tax)
    .forEach((charge) => {
      chargeDetails[charge.name] = {
        percentage: charge.percentage,
        amount: charge.amount.toFixed(2),
      };
    });

  // Build orders array from cart items
  const orders: Order[] = items.map((item, index) => ({
    location_id: locationId,
    product_name: item.name,
    quantity: item.quantity,
    order_price: item.price.toFixed(2),
    ordermode_name: orderModeName,
    tax_inclusive: true,
    tax_amount: totalTax > 0 ? (totalTax / items.length).toFixed(2) : "0.00",
    tax_detail: taxDetail,
    sort_order: index + 1,
    parent_sort_order: 0,
    net_amount: (item.price * item.quantity).toFixed(2),
    charge_amount: totalCharges > 0 ? (totalCharges / items.length).toFixed(2) : "0.00",
    charge_details: chargeDetails,
    order_state: {
      submitted: true,
      gift: false,
      void: false,
      comp: false,
      return: false,
      refund: false,
    },
    channel_user: {
      created_by: userName,
    },
    extra_data: {
      category_id: item.category_id,
      product_group_id: item.product_group_id,
    },
    business_date: date,
    order_date: date,
    order_time: time,
  }));

  // Build payment object
  const payments: Payment[] = [
    {
      payment_type_id: paymentMethod.toUpperCase().replace(/\s+/g, "_"),
      payment_type: paymentMethod,
      payment_amount: total.toFixed(2),
      tip_amount: "0.00",
      tendered_amount: tenderedAmount.toFixed(2),
      net_amount: total.toFixed(2),
      currency: "USD",
      currency_exchange_rate: "1.00",
      tags: {},
      terminal: "POS",
      channel_user: {
        created_by: userName,
      },
      payment_date: date,
      payment_time: time,
    },
  ];

  // Build transactions array (for charges and taxes)
  const transactions: Transaction[] = [];

  charges.forEach((charge) => {
    transactions.push({
      transaction_type_name: charge.name,
      amount: charge.amount.toFixed(2),
      transaction_time: time,
      transaction_type_id: charge.id,
    });
  });

  // Build ticket object
  const ticketRequest: TicketRequest = {
    ticket: {
      channel_name: channelName,
      ticket_number: ticketNumber,
      location_id: locationId,
      invoice_number: invoiceNumber,
      ticket_amount: total,
      tax_inclusive: true,
      ordermode_name: orderModeName,
      ticket_tags: {},
      ticket_state: {
        submitted: true,
        closed: false,
        void: false,
      },
      queue_number: ticketNumber % 1000, // Simple queue number
      extra_data: {
        location_name: locationName,
        subtotal: subtotal.toFixed(2),
        total_tax: totalTax.toFixed(2),
        total_charges: totalCharges.toFixed(2),
      },
      business_date: date,
      ticket_created_time: datetime,
      ticket_updated_time: datetime,
      last_order_time: time,
      last_payment_date: date,
      last_payment_time: time,
    },
    orders,
    payments,
    transactions,
  };

  return ticketRequest;
}
