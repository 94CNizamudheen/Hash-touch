
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authService } from "@services/auth/auth.service";
import TenantForm from "./TenantForm";
import Logo from "@assets/logo/logo.png";
import LogoDark from "@assets/logo/logo_dark.png";
import { useTheme } from "@/ui/context/ThemeContext";
import { cn } from "@/lib/utils";
import { useNotification } from "@/ui/context/NotificationContext";

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
  const { showNotification } = useNotification()

  /* =========================
     React Hook Form
  ========================= */
  const form = useForm<TenantLoginForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      domain: "",
      email: "",
      password: "",
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


      // PASS domain + token UPWARD (do not store here)
      await onTenantSelected(data.domain, result.access_token);

    } catch (err: any) {
      showNotification.error(err?.message || "Tenant login failed");
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
        "min-h-screen flex items-center justify-center bg-background px-4 transition-all ",
        showKeyboard && "pb-[320px]"
      )}
    >
      <div className="w-full flex flex-col items-center gap-3 rounded-2xl shadow-lg max-w-lg  ">
        <img
          src={theme === "light" ? Logo : LogoDark}
          alt="Hashmato Logo"
          className="w-50 mt-2"
        />

        <FormProvider {...form}>
          <TenantForm
            onSubmit={form.handleSubmit(onSubmit)}
            setShowKeyboard={setShowKeyboard}
            isLoading={isLoading}
          />
        </FormProvider>
      </div>
    </section>

  );
}
