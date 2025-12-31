import { useEffect, useMemo, useState } from "react";
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
  sort_order: number;
  applied: boolean;
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

/** Get item IDs covered by a specific mapped charge */
function getMappedItemIdsForCharge(
  chargeId: string,
  mappings: DbChargeMapping[],
  items: CartItem[]
): Set<string> {
  const ids = new Set<string>();
  const chargeMappings = mappings.filter(m => m.charge_id === chargeId);

  chargeMappings.forEach(m => {
    if (m.product_id) {
      ids.add(m.product_id);
    }

    if (m.product_group_id) {
      items.forEach(item => {
        if (item.product_group_id === m.product_group_id) {
          ids.add(item.id);
        }
      });
    }

    if (m.category_id) {
      items.forEach(item => {
        if (item.category_id === m.category_id) {
          ids.add(item.id);
        }
      });
    }
  });

  return ids;
}

/** Get all item IDs that are covered by ANY mapped charge */
function getAllMappedItemIds(
  charges: DbCharge[],
  mappings: DbChargeMapping[],
  items: CartItem[]
): Set<string> {
  const all = new Set<string>();

  charges.forEach(charge => {
    const hasMappings = mappings.some(m => m.charge_id === charge.id);
    if (!hasMappings) return;

    const ids = getMappedItemIdsForCharge(charge.id, mappings, items);
    ids.forEach(id => all.add(id));
  });

  return all;
}

/** Calculate applicable subtotal for a charge */
function getChargeApplicableAmount(
  chargeId: string,
  charges: DbCharge[],
  mappings: DbChargeMapping[],
  items: CartItem[]
): number {
  const chargeMappings = mappings.filter(m => m.charge_id === chargeId);

  // 🌍 GLOBAL charge → apply only to items WITHOUT mapped charges
  if (chargeMappings.length === 0) {
    const mappedItemIds = getAllMappedItemIds(charges, mappings, items);

    return items
      .filter(item => !mappedItemIds.has(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // 🎯 MAPPED charge → apply only to its mapped items
  const mappedItemIds = getMappedItemIdsForCharge(
    chargeId,
    mappings,
    items
  );

  return items
    .filter(item => mappedItemIds.has(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/* -------------------------------------------------------
   Hook
------------------------------------------------------- */

export function useCharges(items: CartItem[], subtotal: number) {
  const [charges, setCharges] = useState<DbCharge[]>([]);
  const [mappings, setMappings] = useState<DbChargeMapping[]>([]);
  const [loading, setLoading] = useState(true);

  // Load charges & mappings from local DB
  useEffect(() => {
    const load = async () => {
      try {
        const [chargesData, mappingsData] = await Promise.all([
          chargesLocal.getAllCharges(),
          chargesLocal.getAllMappings(),
        ]);

        setCharges(chargesData.filter(c => c.active === 1));
        setMappings(mappingsData.filter(m => m.active === 1));
      } catch (err) {
        console.error("❌ Failed to load charges:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const calculatedCharges = useMemo<CalculatedCharge[]>(() => {
    if (loading || items.length === 0 || subtotal <= 0) return [];

    const result: CalculatedCharge[] = [];

    for (const charge of charges) {
      const applicableAmount = getChargeApplicableAmount(
        charge.id,
        charges,
        mappings,
        items
      );

      const percentage = Number(charge.percentage ?? 0);
      if (percentage <= 0) continue;

      const applied = applicableAmount > 0;
      const amount = applied
        ? (applicableAmount * percentage) / 100
        : 0;

      result.push({
        id: charge.id,
        name: charge.name,
        code: charge.code ?? null,
        percentage,
        amount,
        is_tax: charge.is_tax === 1,
        sort_order: charge.sort_order ?? 0,
        applied,
      });
    }

    result.sort((a, b) => a.sort_order - b.sort_order);
    return result;
  }, [charges, mappings, items, subtotal, loading]);

  const totalCharges = useMemo(
    () =>
      calculatedCharges
        .filter(c => c.applied)
        .reduce((sum, c) => sum + c.amount, 0),
    [calculatedCharges]
  );

  const totalTax = useMemo(
    () =>
      calculatedCharges
        .filter(c => c.applied && c.is_tax)
        .reduce((sum, c) => sum + c.amount, 0),
    [calculatedCharges]
  );

  return {
    charges: calculatedCharges,
    totalCharges,
    totalTax,
    loading,
  };
}
