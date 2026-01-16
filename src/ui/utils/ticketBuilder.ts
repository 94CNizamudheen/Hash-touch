import type { CartItem } from "@/types/cart";
import type { CalculatedCharge } from "@/ui/hooks/useCharges";
import type { TicketRequest, Order, Payment, Transaction } from "@/types/ticket";
import type { DbTransactionType } from "@/types/transaction-type";

interface BuildTicketParams {
  items: CartItem[];
  charges: CalculatedCharge[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentMethodId: string;
  tenderedAmount: number;
  locationId: string;
  locationName: string;
  orderModeName: string;
  channelName: string;
  userName?: string;
  saleTransactionTypeId: string;
  paymentTransactionTypeId: string;
  transactionTypes: DbTransactionType[];
  queueNumber: number;
  currencyCode: string;
  surchargeAmount?: number; // ✅ NEW: Add surcharge parameter
}

function getCurrentDateTime() {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const isoString = now.toISOString();
  const timePart = isoString.split("T")[1].split(".")[0];
  const timestamp = `${date} ${timePart}+00`;

  return {
    date,
    timestamp,
    datetime: isoString,
  };
}

function generateTicketNumber(): number {
  return parseInt(Date.now().toString().slice(-8));
}

function generateInvoiceNumber(): string {
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
    paymentMethodId,
    tenderedAmount,
    locationId,
    locationName,
    orderModeName,
    channelName,
    userName = "POS User",
    saleTransactionTypeId,
    paymentTransactionTypeId,
    transactionTypes,
    queueNumber,
    currencyCode,
    surchargeAmount = 0, 
  } = params;

  const { date, timestamp } = getCurrentDateTime();
  const ticketNumber = generateTicketNumber();
  const invoiceNumber = generateInvoiceNumber();

  const totalTax = charges
    .filter((c) => c.is_tax)
    .reduce((sum, c) => sum + c.amount, 0);

  const totalCharges = charges
    .filter((c) => !c.is_tax)
    .reduce((sum, c) => sum + c.amount, 0);

  const taxDetail: Record<string, number> = {};
  charges
    .filter((c) => c.is_tax)
    .forEach((charge) => {
      taxDetail[charge.name] = charge.percentage;
    });

  const chargeDetails: Record<string, number> = {};
  charges
    .filter((c) => !c.is_tax)
    .forEach((charge) => {
      chargeDetails[charge.name] = charge.amount;
    });

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
    order_time: timestamp,
  }));

  // ✅ UPDATED: Add surcharge as tip_amount
  const payments: Payment[] = [
    {
      payment_type_id: paymentMethodId,
      payment_type: paymentMethod,
      payment_amount: total.toFixed(2),
      tip_amount: surchargeAmount.toFixed(2), // ✅ Changed from "0.00" to surcharge
      tendered_amount: tenderedAmount.toFixed(2),
      net_amount: total.toFixed(2),
      currency: currencyCode || "USD",
      currency_exchange_rate: "1.00",
      tags: {},
      terminal: "POS",
      channel_user: {
        created_by: userName,
      },
      payment_date: date,
      payment_time: timestamp,
    },
  ];

  const transactions: Transaction[] = [];

  transactions.push({
    transaction_type_name: "SALE",
    amount: subtotal.toFixed(2),
    transaction_time: timestamp,
    transaction_type_id: saleTransactionTypeId,
  });

  transactions.push({
    transaction_type_name: "PAYMENT",
    amount: total.toFixed(2),
    transaction_time: timestamp,
    transaction_type_id: paymentTransactionTypeId,
  });

  const chargesByTransactionType = charges
    .filter((charge) => charge.applied && charge.transaction_type_id)
    .reduce((acc, charge) => {
      const typeId = charge.transaction_type_id!;
      if (!acc[typeId]) {
        acc[typeId] = {
          transaction_type_id: typeId,
          amount: 0,
        };
      }
      acc[typeId].amount += charge.amount;
      return acc;
    }, {} as Record<string, { transaction_type_id: string; amount: number }>);

  Object.values(chargesByTransactionType).forEach(({ transaction_type_id, amount }) => {
    const transactionType = transactionTypes.find((tt) => tt.id === transaction_type_id);

    transactions.push({
      transaction_type_name: transactionType?.name || "CHARGE",
      amount: amount.toFixed(2),
      transaction_time: timestamp,
      transaction_type_id,
    });
  });

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
      queue_number: queueNumber,
      extra_data: {
        location_name: locationName,
        subtotal: subtotal.toFixed(2),
        total_tax: totalTax.toFixed(2),
        total_charges: totalCharges.toFixed(2),
      },
      business_date: date,
      ticket_created_time: timestamp,
      ticket_updated_time: timestamp,
      last_order_time: timestamp,
      last_payment_date: date,
      last_payment_time: timestamp,
      delivery_date: date,
      delivery_time: timestamp,
    },
    orders,
    payments,
    transactions,
  };

  return ticketRequest;
}