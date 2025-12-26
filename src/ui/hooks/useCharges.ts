import { useState, useEffect } from "react";
import { chargesLocal } from "@/services/local/charges.local.service";
import type { DbCharge, DbChargeMapping } from "@/types/charges";
import type { CartItem } from "@/types/cart";

export interface CalculatedCharge {
  id: string;
  name: string;
  code: string | null;
  percentage: number;
  amount: number;
  is_tax: boolean;
}

export function useCharges(items: CartItem[], subtotal: number) {
  const [charges, setCharges] = useState<DbCharge[]>([]);
  const [mappings, setMappings] = useState<DbChargeMapping[]>([]);
  const [loading, setLoading] = useState(true);

  // Load charges and mappings from database
  useEffect(() => {
    const loadCharges = async () => {
      try {
        const [chargesData, mappingsData] = await Promise.all([
          chargesLocal.getAllCharges(),
          chargesLocal.getAllMappings(),
        ]);
        setCharges(chargesData.filter((c) => c.active === 1));
        setMappings(mappingsData.filter((m) => m.active === 1));
      } catch (error) {
        console.error("Failed to load charges:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCharges();
  }, []);

  // Calculate applicable charges
  const calculatedCharges: CalculatedCharge[] = [];

  if (!loading && items.length > 0) {
    // Get unique product IDs and category IDs from cart
    const productIds = new Set(items.map((item) => item.id));
    const categoryIds = new Set(
      items.map((item) => item.category_id).filter(Boolean)
    );

    // Find applicable charges
    const applicableChargeIds = new Set<string>();

    mappings.forEach((mapping) => {
      // Check if mapping applies to any item in cart
      const appliesToProduct =
        mapping.product_id && productIds.has(mapping.product_id);
      const appliesToCategory =
        mapping.category_id && categoryIds.has(mapping.category_id);

      // For product_group mappings, check if product_group_id matches any item's product_group_id
      const appliesToProductGroup =
        mapping.product_group_id &&
        items.some((item) => item.product_group_id === mapping.product_group_id);

      if (appliesToProduct || appliesToCategory || appliesToProductGroup) {
        applicableChargeIds.add(mapping.charge_id);
      }
    });

    // Calculate charge amounts
    applicableChargeIds.forEach((chargeId) => {
      const charge = charges.find((c) => c.id === chargeId);
      if (!charge) return;

      const percentage = parseFloat(charge.percentage || "0");
      const amount = (subtotal * percentage) / 100;

      calculatedCharges.push({
        id: charge.id,
        name: charge.name,
        code: charge.code || null,
        percentage,
        amount,
        is_tax: charge.is_tax === 1,
      });
    });
  }

  const totalCharges = calculatedCharges.reduce((sum, c) => sum + c.amount, 0);
  const totalTax = calculatedCharges
    .filter((c) => c.is_tax)
    .reduce((sum, c) => sum + c.amount, 0);

  return {
    charges: calculatedCharges,
    totalCharges,
    totalTax,
    loading,
  };
}
