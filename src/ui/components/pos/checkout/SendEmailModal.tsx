

import { Button } from "@/ui/shadcn/components/ui/button";
import { Input } from "@/ui/shadcn/components/ui/input";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SendEmailModalProps {
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void> | void;
}

export default function SendEmailModal({
  isOpen,
  loading,
  onClose,
  onSend,
}: SendEmailModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("Please enter a valid email"));
      return;
    }

    setError("");
    await onSend(email);
    setEmail("");
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-lg bg-secondary p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {t("Send Receipt via Email")}
        </h2>

        <Input
          type="email"
          placeholder={t("Customer email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="destructive" onClick={onClose}>
            {t("Cancel")}
          </Button>

          <Button onClick={handleSend} disabled={loading}>
            {loading ? t("Sending...") : t("Send")}
          </Button>
        </div>
      </div>
    </div>
  );
}
