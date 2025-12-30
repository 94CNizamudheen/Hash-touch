import { useState, useEffect } from "react";
import { paymentMethodLocal } from "@/services/local/payment-method.local.service";
import type { DbPaymentMethod } from "@/types/payment_methods";

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<DbPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setLoading(true);
        const data = await paymentMethodLocal.getAllPaymentMethods();
        // Filter only active payment methods and sort by sort_order and name
        const activeMethods = data
          .filter((pm) => pm.active === 1)
          .sort((a, b) => {
            if (a.sort_order !== b.sort_order) {
              return a.sort_order - b.sort_order;
            }
            return a.name.localeCompare(b.name);
          });
        setPaymentMethods(activeMethods);
        setError(null);
      } catch (err) {
        console.error("Failed to load payment methods:", err);
        setError(err instanceof Error ? err.message : "Failed to load payment methods");
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  return {
    paymentMethods,
    loading,
    error,
  };
}
