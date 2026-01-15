import { getGiftCardConfig } from "./GiftCardConfig";
import { rbsGiftCardService } from "./rbsGiftCardService";
import { resolveGiftCardContact } from "./utils/giftCardContact.util";

export async function processGiftCardFlow({
  paymentMethod,
  amount,
  receiptNumber,
  mode, // "purchase" | "redeem"

  // UI callbacks
  getUserName,
  getOtp,
  getUserNamesIfRequired,
}: {
  paymentMethod: any;
  amount: number;
  receiptNumber: string;
  mode: "purchase" | "redeem";

  getUserName: () => Promise<string | null>;
  getOtp: () => Promise<string | null>;
  getUserNamesIfRequired: () => Promise<{
    firstName: string;
    lastName: string;
  } | null>;
}) {
  /* 1️⃣ Parse processor config */
  const config = getGiftCardConfig(paymentMethod.processor);
  if (!config) throw new Error("Gift card config missing");

  /* 2️⃣ Token */
  const token = await rbsGiftCardService.getToken(config);

  /* 3️⃣ Username */
  const userName = await getUserName();
  if (!userName) throw new Error("Username cancelled");

  const contact = resolveGiftCardContact(userName);

  /* 4️⃣ Send OTP */
  const sendOtpRes = await rbsGiftCardService.sendOtp(
    token,
    {
      channel: contact.channel,       // EMAIL | PHONE
      email: contact.email,
      phone: contact.phone,

      // POS context (FROM PROCESSOR)
      applicationName: config.applicationName,
      terminalId: config.terminalId,
    },
    config.baseUrl
  );

  if (!sendOtpRes.data?.Success) {
    throw new Error(
      sendOtpRes.data?.Message || "OTP send failed"
    );
  }

  const referenceID =
    sendOtpRes.data?.Data?.ReferenceID;

  if (!referenceID) {
    throw new Error("OTP reference ID missing");
  }

  /* 5️⃣ Verify OTP */
  const otp = await getOtp();
  if (!otp) throw new Error("OTP cancelled");

  const verifyRes = await rbsGiftCardService.verifyOtp(
    token,
    {
      referenceID,
      otpCode: otp,
    },
    config.baseUrl
  );

  if (!verifyRes.data?.Success) {
    throw new Error(
      verifyRes.data?.Message || "Wrong OTP"
    );
  }

  const verificationToken =
    verifyRes.data?.Data?.VerificationToken;

  if (!verificationToken) {
    throw new Error("Verification token missing");
  }

  /* 6️⃣ User existence check */
  const userDetails =
    verifyRes.data?.Data?.UserDetails;

  let firstName = "";
  let lastName = "";

  if (
    mode === "purchase" &&
    (!userDetails || !userDetails.FirstName)
  ) {
    const names = await getUserNamesIfRequired();
    if (!names) throw new Error("Name input cancelled");

    firstName = names.firstName;
    lastName = names.lastName;
  }

  /* 7️⃣ Final API */
  if (mode === "purchase") {
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
