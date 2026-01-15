import { getGiftCardConfig } from "./GiftCardConfig";
import { rbsGiftCardService } from "./rbsGiftCardService";

export async function purchaseGiftCard({
  paymentMethod,
  amount,
  receiptNumber,
  verificationToken,
  firstName,
  lastName,
}: {
  paymentMethod: any;
  amount: number;
  receiptNumber: string;
  verificationToken: string;
  firstName: string;
  lastName: string;
}) {
  const config = getGiftCardConfig(paymentMethod.processor);
  if (!config) throw new Error("Gift card config missing");

  const token = await rbsGiftCardService.getToken(config);

  return rbsGiftCardService.purchase(
    token,
    {
      amount,
      receiptNumber,
      verificationToken,
      firstName,
      lastName,
    },
    config.baseUrl
  );
}
