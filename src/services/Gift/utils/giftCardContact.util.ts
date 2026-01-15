export function resolveGiftCardContact(username: string): {
  channel: "EMAIL" | "PHONE";
  email: string;
  phone: string;
} {
  const value = username.trim();

  const isPhone = /^\+?[0-9]{8,15}$/.test(value);

  if (isPhone) {
    return {
      channel: "PHONE",
      email: "",
      phone: value,
    };
  }

  return {
    channel: "EMAIL",
    email: value,
    phone: "",
  };
}
