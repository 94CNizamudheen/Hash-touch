/* eslint-disable react-hooks/exhaustive-deps */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Product,
  ProductWithCombinations,
  ProductGroup,
  ProductGroupCategory,
} from "@/types/products";

import { productLocal } from "@/services/local/product.local.service";
import { getProductWithCombinations } from "@/services/local/product-combo.local.service";
import { productGroupLocal } from "@/services/local/product-group.local.service";
import { productGroupCategoryLocal } from "@/services/local/product-group-category.local.service";
import { buildOverrideKey, getEffectiveProduct } from "../utils/overrides";
import { useAppState } from "../hooks/useAppState";

interface ProductContextType {
  items: Product[];
  rawItems: Product[];
  productGroups: ProductGroup[];
  groupCategories: ProductGroupCategory[];

  selectedGroup: string;
  setSelectedGroup: (id: string) => void;

  selectedCategory: string;
  setSelectedCategory: (id: string) => void;

  search: string;
  setSearch: (value: string) => void;

  filteredItems: Product[];
  loading: boolean;

  applyOverrides: (orderModeId: string) => void;
  loadProductWithCombinations: (
    productId: string
  ) => Promise<ProductWithCombinations>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [rawItems, setRawItems] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [groupCategories, setGroupCategories] = useState<ProductGroupCategory[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { state: appState } = useAppState();

  console.log("🟢 ProductProvider rendered, appState.selected_order_mode_id:", appState?.selected_order_mode_id);

  /* ----------------------------------------
     Debug: Track appState changes
  ----------------------------------------- */
  useEffect(() => {
    console.log("AppState changed:", {
      selected_order_mode_id: appState?.selected_order_mode_id,
      brand_id: appState?.brand_id,
      location_id: appState?.selected_location_id,
      device_role: appState?.device_role,
    });
  }, [appState]);

  /* ----------------------------------------
     Load products ONCE on mount
  ----------------------------------------- */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [prods, groups, groupCats] = await Promise.all([
          productLocal.getAll(),
          productGroupLocal.getAll(),
          productGroupCategoryLocal.getAll(),
        ]);

        console.log(" Initial load: products from DB:", prods.length);

        // Debug: Check if products have overrides
        const productsWithOverrides = prods.filter(p => {
          if (!p.overrides) return false;
          try {
            const parsed = typeof p.overrides === 'string' ? JSON.parse(p.overrides) : p.overrides;
            return Array.isArray(parsed) && parsed.length > 0;
          } catch {
            return false;
          }
        });

        console.log(`Products with overrides: ${productsWithOverrides.length} / ${prods.length}`);
        if (productsWithOverrides.length > 0) {
          const sample = productsWithOverrides[0];
          console.log(`Sample product with overrides:`, {
            name: sample.name,
            price: sample.price,
            overrides: sample.overrides
            
          });
        }

        setRawItems(prods);
        setProductGroups(groups);
        setGroupCategories(groupCats);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Only run once on mount

  /* ----------------------------------------
     Apply overrides when order mode changes
  ----------------------------------------- */
  useEffect(() => {
    if (!appState || rawItems.length === 0) {
      console.log("⚠️ No appState or no raw items, skipping override application");
      return;
    }

    if (
      appState.brand_id &&
      appState.selected_location_id &&
      appState.device_role &&
      appState.selected_order_mode_id
    ) {
      const key = buildOverrideKey({
        channel: appState.device_role,
        brandId: appState.brand_id,
        locationId: appState.selected_location_id,
        orderModeId: appState.selected_order_mode_id,
      });


      const effectiveProducts = rawItems.map(p => getEffectiveProduct(p, key));

      setItems(effectiveProducts);
    } else {
      setItems(rawItems);
    }
  }, [
    appState?.selected_order_mode_id,
    appState?.brand_id,
    appState?.selected_location_id,
    appState?.device_role,
    rawItems.length // Use length instead of the array itself to avoid unnecessary re-renders
  ]);

  /* ----------------------------------------
     Select first product group by default
  ----------------------------------------- */
  useEffect(() => {
    if (selectedGroup || !productGroups.length) return;

    const firstActiveGroup = productGroups
      .filter(g => g.active === 1)
      .sort((a, b) => a.sort_order - b.sort_order)[0];

    if (firstActiveGroup) {
      setSelectedGroup(firstActiveGroup.id);
    }
  }, [productGroups, selectedGroup]);

  /* ----------------------------------------
     Reset category when group changes
  ----------------------------------------- */
  useEffect(() => {
    if (!selectedGroup) return;

    const firstCat = groupCategories
      .filter(c => c.product_group_id === selectedGroup && c.active === 1)
      .sort((a, b) => a.sort_order - b.sort_order)[0];

    if (firstCat) setSelectedCategory(firstCat.id);
  }, [selectedGroup, groupCategories]);

    // Debounce search input

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); 

    return () => clearTimeout(timer);
  }, [search]);

  /* ----------------------------------------
     Filter products for UI
  ----------------------------------------- */
  const filteredItems = useMemo(() => {
    let result = [...items];

    // If searching, search globally (ignore category)
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term));
    } else {
      // Only filter by category when NOT searching
      if (selectedCategory) {
        result = result.filter(p => p.category_id === selectedCategory);
      }
    }

    return result;
  }, [items, selectedCategory, debouncedSearch]);

  /* ----------------------------------------
     Load combos for one product
  ----------------------------------------- */
  const loadProductWithCombinations = async (
    productId: string
  ): Promise<ProductWithCombinations> => {
    const p = await getProductWithCombinations(productId);
    return {
      ...p,
      active: (p as any).active ?? true,
      sort_order: (p as any).sort_order ?? 0,
    } as ProductWithCombinations;
  };

  /* ----------------------------------------
     Manually apply overrides (optional)
  ----------------------------------------- */
  const applyOverrides = (orderModeId: string) => {
    if (!appState) return;

    const key = buildOverrideKey({
      channel: appState.device_role ?? "POS",
      brandId: appState.brand_id!,
      locationId: appState.selected_location_id!,
      orderModeId,
    });
    const effective = rawItems.map(p => getEffectiveProduct(p, key));
    setItems(effective);
  };

  return (
    <ProductContext.Provider
      value={{
        items,
        rawItems,
        productGroups,
        groupCategories,

        selectedGroup,
        setSelectedGroup,
        selectedCategory,
        setSelectedCategory,

        search,
        setSearch,

        filteredItems,
        loading,

        loadProductWithCombinations,
        applyOverrides,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProducts must be used within <ProductProvider>");
  }
  return ctx;
};
