import { Button } from "@/ui/shadcn/components/ui/button";
import TenantInput from "./TenantInput";

interface TenantFormProps {
  onSubmit: () => void;
  setShowKeyboard: (v: boolean) => void;
  isLoading?: boolean;
}

export default function TenantForm({
  onSubmit,
  setShowKeyboard,
  isLoading,
}: TenantFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-4 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg max-w-sm"
    >
      {/* Tenant Name */}
      <TenantInput
        name="domain"
        label="Tenant Name"
        icon="home"
        onShowKeyboard={setShowKeyboard}
      />

      <TenantInput
        name="email"
        label="Email"
        icon="user"
        onShowKeyboard={setShowKeyboard}
      />

      <TenantInput
        name="password"
        label="Password"
        type="password"
        icon="lock"
        onShowKeyboard={setShowKeyboard}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-3 text-white text-base font-medium bg-primary hover:bg-primary/90 py-5 rounded-xl"
      >
        {isLoading ? "Signing in..." : "Continue"}
      </Button>
    </form>
  );
}
