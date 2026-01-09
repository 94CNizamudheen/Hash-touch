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
}

function getCurrentDateTime() {
  const now = new Date();

  // Get UTC date in YYYY-MM-DD format
  const date = now.toISOString().split("T")[0];

  // Get UTC time components from ISO string
  const isoString = now.toISOString();
  const timePart = isoString.split("T")[1].split(".")[0]; // HH:MM:SS

  // Format: "YYYY-MM-DD HH:MM:SS+00" (UTC)
  const timestamp = `${date} ${timePart}+00`;

  return {
    date,
    timestamp,
    datetime: isoString,
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
  } = params;

  const { date, timestamp } = getCurrentDateTime();
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

  // Build tax detail object - Backend expects: {"VAT": 7} (percentage as value)
  const taxDetail: Record<string, number> = {};
  charges
    .filter((c) => c.is_tax)
    .forEach((charge) => {
      taxDetail[charge.name] = charge.percentage;
    });

  // Build charge details object - Backend expects: {"service_charge": 1.5} (amount as value)
  const chargeDetails: Record<string, number> = {};
  charges
    .filter((c) => !c.is_tax)
    .forEach((charge) => {
      chargeDetails[charge.name] = charge.amount;
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
    order_time: timestamp,
  }));

  // Build payment object
  const payments: Payment[] = [
    {
      payment_type_id: paymentMethodId,
      payment_type: paymentMethod,
      payment_amount: total.toFixed(2),
      tip_amount: "0.00",
      tendered_amount: tenderedAmount.toFixed(2),
      net_amount: total.toFixed(2),
      currency: currencyCode|| "USD",
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

  // Build transactions array
  const transactions: Transaction[] = [];

  // 1. SALE transaction - subtotal amount
  transactions.push({
    transaction_type_name: "SALE",
    amount: subtotal.toFixed(2),
    transaction_time: timestamp,
    transaction_type_id: saleTransactionTypeId,
  });

  // 2. PAYMENT transaction - total amount
  transactions.push({
    transaction_type_name: "PAYMENT",
    amount: total.toFixed(2),
    transaction_time: timestamp,
    transaction_type_id: paymentTransactionTypeId,
  });

  // 3. Charge transactions (TAX, etc.) - group by transaction_type_id and sum amounts
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

  // Create transactions from grouped charges
  Object.values(chargesByTransactionType).forEach(({ transaction_type_id, amount }) => {
    const transactionType = transactionTypes.find((tt) => tt.id === transaction_type_id);

    transactions.push({
      transaction_type_name: transactionType?.name || "CHARGE",
      amount: amount.toFixed(2),
      transaction_time: timestamp,
      transaction_type_id,
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
