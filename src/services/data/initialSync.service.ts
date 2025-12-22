import { commonDataService } from "./common.data.service";

import { productLocal } from "../local/product.local.service";
import { productTagGroupLocal } from "../local/product-tag-group.local.service";
import { productTagLocal } from "../local/product-tag.local.service";
import { productGroupLocal } from "../local/product-group.local.service";
import { productGroupCategoryLocal } from "../local/product-group-category.local.service";

export async function initialSync(
  domain: string,
  token: string,
  context: {
    channel: string;
    locationId: string;
    brandId: string;
    orderModeIds: string[] | null;
  }
) {
  console.log("Initial sync started (from combinations)");

  const combinationsResponse = await commonDataService.getCombinations(
    domain,
    token,
    {
      channel: context.channel,
      location_id: context.locationId,
      brand_id: context.brandId,
      order_mode_ids: context.orderModeIds ?? [],
    }
  );

  console.log(" combinations count:", combinationsResponse.length);

  /* ======================================================
      1️⃣ PRODUCT GROUPS
  ====================================================== */
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
    (c.products ?? []).map((p: any) => ({
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
    }))
  )
);


  await productLocal.save(dbProducts);
  console.log(`Products synced: ${dbProducts.length}`);


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

  console.log(" Initial sync completed successfully (from combinations)");
}
