import { getGiftCardConfig } from "./GiftCardConfig";
import { rbsGiftCardService } from "./rbsGiftCardService";

export async function redeemGiftCard({
  paymentMethod,
  amount,
  receiptNumber,
  verificationToken,
}: {
  paymentMethod: any;
  amount: number;
  receiptNumber: string;
  verificationToken: string;
}) {
  const config = getGiftCardConfig(paymentMethod.processor);
  if (!config) throw new Error("Gift card config missing");

  const token = await rbsGiftCardService.getToken(config);

  return rbsGiftCardService.redeem(
    token,
    {
      amount,
      receiptNumber,
      verificationToken,
    },
    config.baseUrl
  );
}
