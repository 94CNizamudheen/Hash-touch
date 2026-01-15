import { getGiftCardConfig } from "../GiftCardConfig";
import { rbsGiftCardService } from "../rbsGiftCardService";

/* =====================================================
   CONTACT RESOLVER (SAME AS CURRENT)
===================================================== */

export const resolveGiftCardContact = (username: string) => {
  const isEmail = username.includes("@");

  return {
    channel: isEmail ? "EMAIL" : "PHONE",
    email: isEmail ? username : "",
    phone: !isEmail ? username : "",
  };
};

/* =====================================================
   SEND OTP (EXACT LOGIC MOVED)
===================================================== */

export const sendGiftCardOtp = async ({
  username,
  paymentMethod,
}: {
  username: string;
  paymentMethod: any;
}) => {
  // 1️⃣ Config
  const config = getGiftCardConfig(paymentMethod.processor);
  if (!config) {
    throw new Error("Gift card configuration missing");
  }

  // 2️⃣ Token
  const token = await rbsGiftCardService.getToken(config);

  // 3️⃣ Contact
  const contact = resolveGiftCardContact(username);

  // 4️⃣ RBS payload (DO NOT TYPE – KEEP AS ANY)
  const payload: any = {
    Channel: contact.channel,
  };

  if (contact.channel === "EMAIL") {
    payload.Email = contact.email;
  }

  if (contact.channel === "PHONE") {
    payload.Phone = contact.phone;
  }

  if (config.applicationName) {
    payload.ApplicationName = config.applicationName;
  }

  if (config.terminalId) {
    payload.TerminalId = config.terminalId;
  }

  // 5️⃣ Send OTP
  const res = await rbsGiftCardService.sendOtp(
    token,
    payload,
    config.baseUrl
  );

  if (!res.data?.Success) {
    throw new Error(res.data?.Message || "OTP send failed");
  }

  const referenceId = res.data?.Data?.ReferenceID;
  if (!referenceId) {
    throw new Error("OTP reference ID missing");
  }

  return { token, config, referenceId };
};

/* =====================================================
   VERIFY + PURCHASE / REDEEM (EXACT LOGIC MOVED)
===================================================== */

export const verifyOtpAndApplyGiftCard = async ({
  otp,
  referenceId,
  paymentMethod,
  amount,
  getUserNamesIfRequired,
}: {
  otp: string;
  referenceId: string;
  paymentMethod: any;
  amount: number;
  getUserNamesIfRequired?: () => Promise<
    { firstName: string; lastName: string } | null
  >;
}) => {
  const config = getGiftCardConfig(paymentMethod.processor);
  if (!config) {
    throw new Error("Gift card configuration missing");
  }

  const token = await rbsGiftCardService.getToken(config);

  const verifyRes = await rbsGiftCardService.verifyOtp(
    token,
    {
      ReferenceID: referenceId,
      OTPCode: otp,
    },
    config.baseUrl
  );

  if (!verifyRes.data?.Success) {
    throw new Error(verifyRes.data?.Message || "Invalid OTP");
  }

  const { VerificationToken, IsUserFound } = verifyRes.data.Data || {};

  if (!VerificationToken) {
    throw new Error("Verification token missing");
  }

  let firstName: string | undefined;
  let lastName: string | undefined;

  // PURCHASE
  if (paymentMethod.code === "Purchase card") {
    if (!IsUserFound && getUserNamesIfRequired) {
      const names = await getUserNamesIfRequired();
      if (!names) {
        throw new Error("User creation cancelled");
      }
      firstName = names.firstName;
      lastName = names.lastName;
    }

    const purchaseRes = await rbsGiftCardService.purchase(
      token,
      {
        Amount: Number(amount),
        ReceiptNumber: `POS-${Date.now()}`,
        VerificationToken,
        ...(firstName && { FirstName: firstName }),
        ...(lastName && { LastName: lastName }),
      },
      config.baseUrl
    );

    if (!purchaseRes.data?.Success) {
      throw new Error(
        purchaseRes.data?.Message || "Gift card purchase failed"
      );
    }
  }

  // REDEEM
  if (paymentMethod.code === "Redeem Card") {
    if (!IsUserFound) {
      throw new Error("Gift card user not found. Cannot redeem.");
    }

    const redeemRes = await rbsGiftCardService.redeem(
      token,
      {
        Amount: Number(amount),
        ReceiptNumber: `POS-${Date.now()}`,
        VerificationToken,
      },
      config.baseUrl
    );

    if (!redeemRes.data?.Success) {
      throw new Error(
        redeemRes.data?.Message || "Gift card redeem failed"
      );
    }
  }

  return { success: true };
};
