import { useState, useEffect } from "react";
import { transactionTypeLocal } from "@/services/local/transaction-type.local.service";
import type { DbTransactionType } from "@/types/transaction-type";

export function useTransactionTypes() {
  const [transactionTypes, setTransactionTypes] = useState<DbTransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactionTypes = async () => {
      try {
        setLoading(true);
        const data = await transactionTypeLocal.getAllTransactionTypes();
        // Filter only active transaction types and sort by sort_order and name
        const activeTypes = data
          .filter((tt) => tt.active === 1)
          .sort((a, b) => {
            if (a.sort_order !== b.sort_order) {
              return a.sort_order - b.sort_order;
            }
            return a.name.localeCompare(b.name);
          });
        setTransactionTypes(activeTypes);
        setError(null);
      } catch (err) {
        console.error("Failed to load transaction types:", err);
        setError(err instanceof Error ? err.message : "Failed to load transaction types");
      } finally {
        setLoading(false);
      }
    };

    loadTransactionTypes();
  }, []);

  return {
    transactionTypes,
    loading,
    error,
  };
}
