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

interface ProductContextType {
  items: Product[];

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

  loadProductWithCombinations: (
    productId: string
  ) => Promise<ProductWithCombinations>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [groupCategories, setGroupCategories] = useState<ProductGroupCategory[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------
        Fetch from SQLite on app load
  ----------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [prods, groups, groupCats] = await Promise.all([
          productLocal.getAll(),
          productGroupLocal.getAll(),
          productGroupCategoryLocal.getAll(),
        ]);

        setItems(prods);
        setProductGroups(groups);
        setGroupCategories(groupCats);

      
        if (groups.length) {
          const firstGroupId = groups[0].id;
          setSelectedGroup(firstGroupId);

          const firstCat = groupCats
            .filter((c) => c.product_group_id === firstGroupId && c.active === 1)
            .sort((a, b) => a.sort_order - b.sort_order)[0];

          if (firstCat) {
            setSelectedCategory(firstCat.id);
          }
        }
      } catch (err) {
        console.error("ProductContext fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ----------------------------------------
        When group changes → reset category
  ----------------------------------------- */
  useEffect(() => {
    if (!selectedGroup) return;

    const firstCat = groupCategories
      .filter((c) => c.product_group_id === selectedGroup && c.active === 1)
      .sort((a, b) => a.sort_order - b.sort_order)[0];

    if (firstCat) {
      setSelectedCategory(firstCat.id);
    }
  }, [selectedGroup, groupCategories]);

  /* ----------------------------------------
        Filter products
  ----------------------------------------- */
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory) {
      result = result.filter(
        (p) => p.category_id === selectedCategory
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(term)
      );
    }

    return result;
  }, [items, selectedCategory, search]);

  /* ----------------------------------------
        Load combos for ONE product
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

  return (
    <ProductContext.Provider
      value={{
        items,

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
