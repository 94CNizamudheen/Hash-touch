import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/ui/shadcn/components/ui/button";
import ProductGroupTag from "./ProductGroupTag";
import {
  getProductWithCombinations,
  type ProductWithCombinations,
  type ProductTagGroupUI,
} from "@/services/local/product-combo.local.service";
import { useTranslation } from "react-i18next";

interface SelectedTag {
  groupId: string;
  tagId: string;
  name: string;
  price: number;
  quantity: number;
}

interface ProductTagGroupModalProps {
  open: boolean;
  productId: string;
  productName: string;
  productPrice: number;
  onClose: () => void;
  onConfirm: (selectedTags: { name: string; qty: number; price: number }[]) => void;
  initialModifiers?: { name: string; qty: number; price: number }[];
  isEditMode?: boolean;
}

interface ValidationError {
  groupId: string;
  groupName: string;
  message: string;
}

export default function ProductTagGroupModal({
  open,
  productId,
  productName,
  onClose,
  onConfirm,
  initialModifiers = [],
  isEditMode = false,
}: ProductTagGroupModalProps) {
  const { t } = useTranslation();
  const [productData, setProductData] = useState<ProductWithCombinations | null>(null);
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const loadProductData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductWithCombinations(productId);
      setProductData(data);

      // Pre-populate selected tags from initial modifiers
      if (initialModifiers && initialModifiers.length > 0 && data.combinations) {
        const preSelectedTags: SelectedTag[] = [];

        initialModifiers.forEach((modifier) => {
          // Find which tag group and tag this modifier belongs to
          data.combinations.forEach((group) => {
            const matchingOption = group.options.find(
              (opt) => opt.name === modifier.name && opt.price === modifier.price
            );
            if (matchingOption) {
              preSelectedTags.push({
                groupId: group.id,
                tagId: matchingOption.id,
                name: matchingOption.name,
                price: matchingOption.price,
                quantity: modifier.qty,
              });
            }
          });
        });

        setSelectedTags(preSelectedTags);
      }
    } catch (error) {
      console.error("Failed to load product combinations:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (open && productId) {
      loadProductData();
    } else {
      setSelectedTags([]);
      setProductData(null);
      setValidationErrors([]);
    }
  }, [open, productId, loadProductData]);

  const handleTagClick = (group: ProductTagGroupUI, tagId: string) => {
    const tag = group.options.find((opt) => opt.id === tagId);
    if (!tag) return;

    setSelectedTags((prev) => {
      const existingTag = prev.find((t) => t.groupId === group.id && t.tagId === tagId);
      
      if (existingTag) {
        // Tag already selected, don't add again - quantity is controlled by +/- buttons
        return prev;
      }

      const groupTags = prev.filter((t) => t.groupId === group.id);
      const totalInGroup = groupTags.reduce((sum, t) => sum + t.quantity, 0);

      // Check if we can add more items to this group
      if (totalInGroup >= group.max_items) {
        return prev; // Cannot add more
      }

      // Add new tag with quantity 1
      return [
        ...prev,
        { groupId: group.id, tagId: tag.id, name: tag.name, price: tag.price, quantity: 1 },
      ];
    });
  };

  const handleQuantityChange = (groupId: string, tagId: string, delta: number) => {
    setSelectedTags((prev) => {
      const newTags = [...prev];
      const tagIndex = newTags.findIndex((t) => t.groupId === groupId && t.tagId === tagId);
      
      if (tagIndex === -1) return prev;

      const tag = newTags[tagIndex];
      const newQuantity = tag.quantity + delta;

      // Get group to check max_items
      const group = productData?.combinations.find((g) => g.id === groupId);
      if (!group) return prev;

      const groupTags = newTags.filter((t) => t.groupId === groupId);
      const totalInGroup = groupTags.reduce((sum, t) => sum + t.quantity, 0);

      // If decreasing
      if (delta < 0) {
        if (newQuantity <= 0) {
          // Remove the tag completely
          return newTags.filter((t) => !(t.groupId === groupId && t.tagId === tagId));
        }
        tag.quantity = newQuantity;
        return newTags;
      }

      // If increasing
      if (totalInGroup >= group.max_items) {
        return prev; // Cannot exceed max
      }

      tag.quantity = newQuantity;
      return newTags;
    });
  };

  const isTagSelected = (groupId: string, tagId: string) => {
    return selectedTags.some((t) => t.groupId === groupId && t.tagId === tagId);
  };

  const getTagQuantity = (groupId: string, tagId: string) => {
    const tag = selectedTags.find((t) => t.groupId === groupId && t.tagId === tagId);
    return tag?.quantity || 0;
  };

  const getSelectedCountForGroup = (groupId: string) => {
    return selectedTags
      .filter((t) => t.groupId === groupId)
      .reduce((sum, t) => sum + t.quantity, 0);
  };

  const validateSelections = (): ValidationError[] => {
    if (!productData || !productData.combinations || productData.combinations.length === 0) {
      return [];
    }

    const errors: ValidationError[] = [];

    productData.combinations.forEach((group) => {
      const selectedCount = getSelectedCountForGroup(group.id);
      
      if (selectedCount < group.min_items) {
        errors.push({
          groupId: group.id,
          groupName: group.name,
          message: `${t("Please select at least")} ${group.min_items} ${t("item(s)")}`,
        });
      }

      if (selectedCount > group.max_items) {
        errors.push({
          groupId: group.id,
          groupName: group.name,
          message: `${t("Please select no more than")} ${group.max_items} ${t("item(s)")}`,
        });
      }
    });

    return errors;
  };


  const handleConfirm = () => {
    const errors = validateSelections();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const modifiers = selectedTags.map((tag) => ({
      name: tag.name,
      qty: tag.quantity,
      price: tag.price,
    }));

    onConfirm(modifiers);
    onClose();
  };



  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-4xl md:max-h-[90vh] bg-secondary z-50 rounded-lg shadow-2xl flex flex-col"
          >
            {/* Header - Hidden in images, keeping minimal */}


            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-gray-500">{t("Loading options...")}</p>
                </div>
              ) : productData && productData.combinations.length > 0 ? (
                <div className="space-y-6">
                  <h1 className="font-semibold text-lg text-foreground flex-1">{productName}</h1>
                  {productData.combinations.map((group) => (
                    <div key={group.id} className="space-y-3">
                      {/* Group Header */}
                      <div className="flex items-center justify-between p-3 border-2 border-blue-300 rounded-lg">
                        <h4 className="font-medium text-lg">{group.name}</h4>
                        <span className="text-sm text-gray-600">
                          {t("Min")}: {group.min_items} | {t("Max")}: {group.max_items} | {t("Selected")}: {getSelectedCountForGroup(group.id)}
                        </span>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        {group.options.map((option) => (
                          <ProductGroupTag
                            key={option.id}
                            title={option.name}
                            price={option.price}
                            min={group.min_items}
                            max={group.max_items}
                            selectedCount={getSelectedCountForGroup(group.id)}
                            isSelected={isTagSelected(group.id, option.id)}
                            quantity={getTagQuantity(group.id, option.id)}
                            onClick={() => handleTagClick(group, option.id)}
                            onQuantityChange={(delta) => handleQuantityChange(group.id, option.id, delta)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <p className="text-gray-500">{t("No customization options available")}</p>
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800 mb-2">{t("Please fix the following:")}</p>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          <strong>{error.groupName}:</strong> {error.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={onClose}
                  className="px-8 h-11 bg-red-500 text-white hover:bg-red-600 rounded-md font-medium"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-8 h-11 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditMode ? t("Save Changes") : t("Add to Cart")}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}