/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authService } from "@services/auth/auth.service";
import TenantForm from "./TenantForm";
import Logo from "@assets/logo/logo.png";
import LogoDark from "@assets/logo/logo_dark.png";
import { useTheme } from "@ui/context/theme/useTheme";
import { cn } from "@/lib/utils";

/* =========================
   Schema (Backend aligned)
========================= */
const tenantSchema = z.object({
  domain: z.string().min(2, "Tenant is required"),
  email: z
    .string()
    .min(3, "Email is required")
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Invalid email format"
    ),
  password: z.string().min(4, "Password must be at least 4 characters"),
});
type TenantLoginForm = z.infer<typeof tenantSchema>;

interface TenantLoginProps {
  onTenantSelected: (domain: string, token: string) => Promise<void>;
}

export default function TenantLogin({
  onTenantSelected,
}: TenantLoginProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  /* =========================
     React Hook Form
  ========================= */
  const form = useForm<TenantLoginForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      domain: "default_tenant",
      email: "admin@default_tenant.com",
      password: "password",
    },
  });

  /* =========================
     Submit Handler
  ========================= */
 const onSubmit = async (data: TenantLoginForm) => {
  try {
    setIsLoading(true);

    const result = await authService.loginTenant({
      domain: data.domain,
      email: data.email,
      password: data.password,
    });

    console.log("✅ Tenant login success",result);

    // PASS domain + token UPWARD (do not store here)
    await onTenantSelected(data.domain, result.access_token);

  } catch (err: any) {
    console.error("❌ Tenant login failed:", err);
    alert(err?.message || "Tenant login failed");
  } finally {
    setIsLoading(false);
  }
};
  console.log(form.formState.errors);
  /* =========================
     UI
  ========================= */
  return (
    <section
      className={cn(
        "max-w-sm md:max-w-md mx-auto flex flex-col justify-center items-center gap-5 transition-all duration-300",
        showKeyboard
          ? "min-h-[calc(100vh-336px)] h-full"
          : "min-h-screen h-screen"
      )}
    >
      <img
        src={theme === "light" ? Logo : LogoDark}
        alt="Hashmato Logo"
        className="w-40 h-auto"
      />

      <FormProvider {...form}>
        <TenantForm
          onSubmit={form.handleSubmit(onSubmit)}
          setShowKeyboard={setShowKeyboard}
          isLoading={isLoading}
        />
      </FormProvider>
    </section>
  );
}
