import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/ui/context/ProductContext";
import { productLocal } from "@/services/local/product.local.service";
import { useNotification } from "@/ui/context/NotificationContext";
import type { Product } from "@/types/products";
import { PackageX, ArrowLeft } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button";
import SoldOutProductItem from "./Soldoutproductitem";
import InputFilter from "@/ui/components/common/InputFilter";

const SoldOutPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { items: allProducts, updateSoldOutInContext } = useProducts();
    const { showNotification } = useNotification();

    const [soldOutIds, setSoldOutIds] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Load sold out products from local storage on mount
    useEffect(() => {
        const loadSoldOutProducts = async () => {
            try {
                setLoading(true);
                const products = await productLocal.getAll();
                const soldOut = new Set(
                    products
                        .filter((p) => p.is_sold_out === 1)
                        .map((p) => p.id)
                );
                setSoldOutIds(soldOut);
            } catch (error) {
                console.error("Failed to load sold out products:", error);
                showNotification.error(t("Failed to load sold out products"));
            } finally {
                setLoading(false);
            }
        };

        loadSoldOutProducts();
    }, [showNotification, t]);

    // Filter products based on search
    const filteredProducts = useMemo(() => {
        if (!search.trim()) return allProducts;
        const term = search.toLowerCase();
        return allProducts.filter(p =>
            p.name.toLowerCase().includes(term)
        );
    }, [allProducts, search]);

    const soldOutProducts = useMemo(() => {
        return filteredProducts.filter(p => soldOutIds.has(p.id));
    }, [filteredProducts, soldOutIds]);

    const productsToRender = search.trim()
        ? filteredProducts
        : soldOutProducts;


    // Get count of products found
    const productsFoundCount = filteredProducts.length;


    // Toggle sold out status
    const handleToggle = async (product: Product) => {
        const newSoldOutStatus = !soldOutIds.has(product.id);

        // 1️⃣ Optimistic UI update (THIS FIXES THE ISSUE)
        updateSoldOutInContext(product.id, newSoldOutStatus);

        setSoldOutIds(prev => {
            const next = new Set(prev);
            if (newSoldOutStatus) {
                next.add(product.id);
            } else {
                next.delete(product.id);
            }
            return next;
        });

        try {
            // 2️⃣ Persist to SQLite
            await productLocal.updateSoldOutStatus(product.id, newSoldOutStatus);

            showNotification.success(
                newSoldOutStatus
                    ? t("Product marked as sold out")
                    : t("Product marked as available"),
                2000
            );
        } catch (error) {
            console.error("Failed to update sold out status:", error);

            // 3️⃣ Rollback UI if DB fails
            updateSoldOutInContext(product.id, !newSoldOutStatus);

            setSoldOutIds(prev => {
                const next = new Set(prev);
                if (!newSoldOutStatus) {
                    next.add(product.id);
                } else {
                    next.delete(product.id);
                }
                return next;
            });

            showNotification.error(t("Failed to update product status"));
        }
    };


    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t("Loading...")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-border bg-background">
                <div className="flex items-center justify-center relative mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/pos")}
                        className="absolute left-0"
                    >
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-xl font-semibold text-foreground">
                        {t("Sold Out Products")}
                    </h1>
                </div>

                {/* Search Input */}
                <InputFilter
                    placeholder={t("Search products...")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                />

                {/* Products count - only show when searching */}
                {search.trim() && (
                    <p className="text-sm text-muted-foreground mt-3">
                        {productsFoundCount} {t("products found")}
                    </p>
                )}
            </div>

            {/* Content Area */}
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {productsToRender.length > 0 ? (
                    <div className="p-4 space-y-3">
                        {productsToRender.map((product) => (
                            <SoldOutProductItem
                                key={product.id}
                                product={product}
                                isSoldOut={soldOutIds.has(product.id)}
                                onToggle={() => handleToggle(product)}
                            />
                        ))}
                    </div>
                ) : (
                    !search.trim() && (
                        /* Empty State — only when NOT searching */
                        <div className="h-full flex items-center justify-center p-8">
                            <div className="text-center max-w-md">
                                <PackageX className="w-24 h-24 text-muted-foreground/40 mx-auto mb-6" />
                                <h2 className="text-xl font-semibold mb-2">
                                    {t("No Sold Out Products")}
                                </h2>
                                <p className="text-muted-foreground">
                                    {t("All products are currently available for sale")}
                                </p>
                            </div>
                        </div>
                    )
                )}
            </div>

        </div>
    );
};

export default SoldOutPage;