
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import EnterPin from "../common/pin";  // your existing PIN keypad
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo-light.png";
import LogoDark from "@/assets/logo-dark.png";

export default function LoginPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [pin, setPin] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async () => {
    if (!pin) return;
    setLoading(true);
    console.log(isSubmitted)
    try {
      // TODO: Replace this with your backend login check
      console.log("🔐 PIN entered:", pin);
      // Example: await invoke("verify_staff_pin", { pin });
      setTimeout(() => {
        setLoading(false);
        console.log("✅ Redirect to start-shift page");
        // e.g., router.push("/start-shift");
      }, 800);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <section className="max-w-sm md:max-w-md mx-auto flex flex-col justify-center items-center gap-5 min-h-screen bg-muted/20">
      {/* Logo */}
      {theme === "light" ? (
        <img src={Logo} alt="Logo" width={200} height={50} className="h-auto" />
      ) : (
        <img src={LogoDark} alt="Logo" width={200} height={50} className="h-auto" />
      )}

      {/* Title */}
      <div className="w-full h-14 flex items-center justify-center bg-white text-black font-light text-lg rounded-lg shadow">
        {t("login") || "Log In"}
      </div>

      {/* PIN entry */}
      <EnterPin
        placeholder="******"
        value={pin}
        onChangeValue={setPin}
        onSubmit={() => setIsSubmitted(true)}
      />

      {/* Continue button */}
      <Button
        onClick={handlePinSubmit}
        disabled={!pin || loading}
        className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
      >
        {loading ? t("loading") || "Loading..." : t("continue") || "Continue"}
      </Button>
    </section>
  );
}
