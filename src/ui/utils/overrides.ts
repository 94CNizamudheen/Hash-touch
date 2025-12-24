import type { Product, ProductOverride } from "@/types/products";

/* =========================
   Build override key
========================= */
export function buildOverrideKey({
  channel,
  brandId,
  locationId,
  orderModeId,
}: {
  channel: string;
  brandId: string;
  locationId: string;
  orderModeId: string;
}) {
  return `ch:${channel.toUpperCase()}|br:${brandId}|loc:${locationId}|om:${orderModeId}`;
}

/* =========================
   Parse overrides safely
========================= */
function parseOverrides(raw: any): ProductOverride[] {
  if (!raw) return [];

  try {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch {
    return [];
  }
}

/* =========================
   Apply overrides to product
========================= */
export function getEffectiveProduct(
  product: Product,
  key: string
): Product {
  const overrides = parseOverrides(product.overrides);

  if (!overrides.length) {
    return product;
  }

  const found = overrides.find((o) => o.key === key);
  if (!found) {
    return product;
  }

  // Only log when override is actually applied
  console.log(`✅ Applying override to ${product.name}: $${product.price} → $${found.price}`);

  return {
    ...product,
    price:
      found.price !== undefined
        ? Number(found.price)
        : product.price,

    name: found.name ?? product.name,
    description: found.description ?? product.description,

    code: (found as any).code ?? product.code,
    active: (found as any).active ?? product.active,

    media:
      (found as any).media !== undefined
        ? JSON.stringify((found as any).media)
        : product.media,
  };
}
