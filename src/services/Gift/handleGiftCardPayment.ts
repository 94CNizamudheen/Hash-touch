import { processGiftCardFlow } from "./processGiftCardFlow";

export async function handleGiftCardPayment(
  paymentMethod: any,
  payload: {
    amount: number;
    receiptNumber: string;

    // UI hooks
    getUserName: () => Promise<string | null>;
    getOtp: () => Promise<string | null>;
    getUserNamesIfRequired: () => Promise<{
      firstName: string;
      lastName: string;
    } | null>;
  }
) {
  switch (paymentMethod.code) {
    case "Purchase card":
      return processGiftCardFlow({
        paymentMethod,
        amount: payload.amount,
        receiptNumber: payload.receiptNumber,
        mode: "purchase",
        getUserName: payload.getUserName,
        getOtp: payload.getOtp,
        getUserNamesIfRequired: payload.getUserNamesIfRequired,
      });

    case "Redeem Card":
      return processGiftCardFlow({
        paymentMethod,
        amount: payload.amount,
        receiptNumber: payload.receiptNumber,
        mode: "redeem",
        getUserName: payload.getUserName,
        getOtp: payload.getOtp,
        getUserNamesIfRequired: async () => null, // NOT USED
      });

    default:
      throw new Error("Not a gift card payment");
  }
}
