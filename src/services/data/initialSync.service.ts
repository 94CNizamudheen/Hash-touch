import { commonDataService } from "./common.data.service";

import { productLocal } from "../local/product.local.service";
import { productTagGroupLocal } from "../local/product-tag-group.local.service";
import { productTagLocal } from "../local/product-tag.local.service";
import { productGroupLocal } from "../local/product-group.local.service";
import { productGroupCategoryLocal } from "../local/product-group-category.local.service";
import { chargesLocal } from "../local/charges.local.service";
import { paymentMethodLocal } from "../local/payment-method.local.service";

export async function initialSync(
  domain: string,
  token: string,
  context: { channel: string; locationId: string; brandId: string;orderModeIds: string[] | null; }) {
  console.log("🚀 Initial sync started (from combinations)");
  console.log("📡 Sync context:", context);

  const combinationsResponse = await commonDataService.getCombinations(
    domain,
    token,
    {
      channel: context.channel,
      location_id: context.locationId,
      brand_id: context.brandId,
      order_mode_id: context.orderModeIds ?? [], 
    }
  );

  console.log("📦 Combinations received:", combinationsResponse.length);


  // Debug: Count all products with overrides in the API response
  let totalProducts = 0;
  let productsWithOverrides = 0;

  combinationsResponse.forEach((g: any) => {
    (g.categories ?? []).forEach((c: any) => {
      (c.products ?? []).forEach((p: any) => {
        totalProducts++;
        if (p.overrides && Array.isArray(p.overrides) && p.overrides.length > 0) {
          productsWithOverrides++;
          if (productsWithOverrides === 1) {
            // Log the first product with overrides
            console.log("🔍 First product with overrides from API:", {
              name: p.name,
              price: p.price,
              overridesCount: p.overrides.length,
              overrides: p.overrides
            });
          }
        }
      });
    });
  });

  console.log(`📊 API Response Summary: ${productsWithOverrides} products with overrides out of ${totalProducts} total products`);


  const dbProductGroups = combinationsResponse.map((g: any) => ({
    id: g.id,
    name: g.name,
    code: g.code ?? null,
    description: g.description ?? null,

    active: g.active ? 1 : 0,
    sort_order: g.sort_order ?? 0,

    created_at: g.created_at ?? null,
    updated_at: g.updated_at ?? null,
    deleted_at: g.deleted_at ?? null,

    created_by: g.created_by ?? null,
    updated_by: g.updated_by ?? null,
    deleted_by: g.deleted_by ?? null,

    media: JSON.stringify(g.media ?? []),
  }));

  console.log("First group to save:", dbProductGroups[0]);
  await productGroupLocal.save(dbProductGroups);
  console.log(` Product groups synced: ${dbProductGroups.length}`);


  const dbGroupCategories = combinationsResponse.flatMap((g: any) =>
    (g.categories ?? []).map((c: any) => ({
      id: c.id,

      product_group_id: g.id, 

      name: c.name,
      code: c.code ?? null,

      active: c.active ? 1 : 0,
      sort_order: c.sort_order ?? 0,

      created_at: c.created_at ?? null,
      updated_at: c.updated_at ?? null,
      deleted_at: c.deleted_at ?? null,

      created_by: c.created_by ?? null,
      updated_by: c.updated_by ?? null,
      deleted_by: c.deleted_by ?? null,

      media: JSON.stringify(c.media ?? []),
    }))
  );

  await productGroupCategoryLocal.save(dbGroupCategories);
  console.log(
    ` Product group categories synced: ${dbGroupCategories.length}`
  );

  const dbProducts = combinationsResponse.flatMap((g: any) =>
  (g.categories ?? []).flatMap((c: any) =>
    (c.products ?? []).map((p: any) => {
      const overridesStr = JSON.stringify(p.overrides ?? []);

      // Debug logging for products with overrides
      if (p.overrides && p.overrides.length > 0) {
        console.log(`💾 Saving product "${p.name}" with overrides:`, p.overrides);
        console.log(`   Stringified:`, overridesStr);
      }

      return {
        id: p.id,
        name: p.name,
        code: p.code ?? null,
        description: p.description ?? null,

        category_id: c.id,

        price: Number(p.price ?? 0),
        active: Boolean(p.active),
        sort_order: Number(p.sort_order ?? 0),

        created_at: p.created_at ?? null,
        updated_at: p.updated_at ?? null,
        deleted_at: p.deleted_at ?? null,

        media: JSON.stringify(p.media ?? []),
        overrides: overridesStr,
      };
    })
  )
);


  console.log(`💾 About to save ${dbProducts.length} products to database`);

  // Debug: Check how many products have overrides before saving
  const productsWithOverridesBeforeSave = dbProducts.filter(p => {
    try {
      const parsed = JSON.parse(p.overrides || '[]');
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  });

  console.log(`📊 Products with overrides before save: ${productsWithOverridesBeforeSave.length} / ${dbProducts.length}`);

  if (productsWithOverridesBeforeSave.length > 0) {
    const sample = productsWithOverridesBeforeSave[0];
    console.log(`📋 Sample product before save:`, {
      name: sample.name,
      overrides: sample.overrides
    });
  }

  await productLocal.save(dbProducts);
  console.log(`✅ Products synced: ${dbProducts.length}`);


  const dbTagGroups = combinationsResponse.flatMap((g: any) =>
    (g.categories ?? []).flatMap((c: any) =>
      (c.products ?? []).flatMap((p: any) =>
        (p.tag_groups ?? []).map((tg: any) => ({
          id: tg.id,

          product_id: p.id,
          name: tg.name,
          min_items: tg.min_items ?? 0,
          max_items: tg.max_items ?? 0,

          active:  tg.active ? 1 : 0,
          sort_order: tg.sort_order ?? 0,

          created_at: tg.created_at ?? null,
          updated_at: tg.updated_at ?? null,
          deleted_at: tg.deleted_at ?? null,
        }))
      )
    )
  );

  await productTagGroupLocal.save(dbTagGroups);
  console.log(`Product tag groups synced: ${dbTagGroups.length}`);


  const dbProductTags = combinationsResponse.flatMap((g: any) =>
    (g.categories ?? []).flatMap((c: any) =>
      (c.products ?? []).flatMap((p: any) =>
        (p.tag_groups ?? []).flatMap((tg: any) =>
          (tg.product_tags ?? []).map((t: any) => ({
            id: t.id,

            tag_group_id: tg.id, 
            product_id: p.id,  
            name: t.name,
            price: Number(t.price ?? 0),

            active: t.active ? 1 : 0,
            sort_order: t.sort_order ?? 0,

            created_at: t.created_at ?? null,
            updated_at: t.updated_at ?? null,
            deleted_at: t.deleted_at ?? null,
          }))
        )
      )
    )
  );

  await productTagLocal.save(dbProductTags);
  console.log(` Product tags synced: ${dbProductTags.length}`);

  // Sync charges
  const chargesResponse = await commonDataService.getCharges(domain, token, {
    channel: context.channel,
    location_id: context.locationId,
    brand_id: context.brandId,
    order_mode_id: context.orderModeIds ?? [],
  });

  console.log("📦 Charges received:", chargesResponse.length);

  const dbCharges = chargesResponse.map((c: any) => ({
    id: c.id,
    code: c.code ?? null,
    name: c.name,
    percentage: c.percentage ?? null,
    is_tax: c.is_tax ? 1 : 0,
    transaction_type_id: c.transaction_type_id ?? null,
    parent_charge_id: c.parent_charge_id ?? null,
    active: c.active ? 1 : 0,
    sort_order: c.sort_order ?? 0,
    created_at: c.created_at ?? null,
    updated_at: c.updated_at ?? null,
    deleted_at: c.deleted_at ?? null,
    created_by: c.created_by ?? null,
    updated_by: c.updated_by ?? null,
    deleted_by: c.deleted_by ?? null,
  }));

  await chargesLocal.saveCharges(dbCharges);
  console.log(`✅ Charges synced: ${dbCharges.length}`);

  const dbChargeMappings = chargesResponse.flatMap((c: any) =>
    (c.mappings ?? []).map((m: any) => ({
      id: m.id,
      charge_id: c.id,
      category_id: m.category_id ?? null,
      product_id: m.product_id ?? null,
      product_group_id: m.product_group_id ?? null,
      active: m.active ? 1 : 0,
      sort_order: m.sort_order ?? 0,
      created_at: m.created_at ?? null,
      updated_at: m.updated_at ?? null,
      deleted_at: m.deleted_at ?? null,
      created_by: m.created_by ?? null,
      updated_by: m.updated_by ?? null,
      deleted_by: m.deleted_by ?? null,
    }))
  );

  await chargesLocal.saveMappings(dbChargeMappings);
  console.log(`✅ Charge mappings synced: ${dbChargeMappings.length}`);

  // Sync payment methods
  const paymentMethodsResponse = await commonDataService.getPaymentTypes(domain, token, {
    channel: context.channel,
    location_id: context.locationId,
    brand_id: context.brandId,
    order_mode_id: context.orderModeIds ?? [],
  });

  console.log("📦 Payment methods received:", paymentMethodsResponse.length);

  const dbPaymentMethods = paymentMethodsResponse.map((pm: any) => ({
    id: pm.id,
    code: pm.code ?? null,
    name: pm.name,
    processor: pm.processor ?? null,
    active: pm.active ? 1 : 0,
    sort_order: pm.sort_order ?? 0,
    created_at: pm.created_at ?? null,
    updated_at: pm.updated_at ?? null,
    deleted_at: pm.deleted_at ?? null,
    created_by: pm.created_by ?? null,
    updated_by: pm.updated_by ?? null,
    deleted_by: pm.deleted_by ?? null,
  }));

  await paymentMethodLocal.savePaymentMethods(dbPaymentMethods);
  console.log(`✅ Payment methods synced: ${dbPaymentMethods.length}`);

  console.log(" Initial sync completed successfully (from combinations)");
}
