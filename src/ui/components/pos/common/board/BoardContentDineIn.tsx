import CardDineIn from "../card/CardDineIn";
import { useCart } from "@/ui/context/CartContext";
import EmptyCart from "@/assets/empty-cart.png";
import ProductTagGroupModal from "../../menu-selection/ProductTagGroupModal";
import { useState } from "react";
import type { CartItem } from "@/types/cart";

const BoardContentDineIn = () => {
  const {
    items,
    increment,
    decrement,
    remove,
    isHydrated,
    updateModifiers,
  } = useCart();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);

  if (!isHydrated) return null;

  const handleCardClick = (item: CartItem) => {
    if (!item.product_id) return;
    setSelectedCartItem(item);
    setModalOpen(true);
  };

  const handleModalConfirm = (modifiers: { name: string; qty: number; price: number }[]) => {
    if (!selectedCartItem || !selectedCartItem.product_id) return;

    const currentModifiersTotal = selectedCartItem.modifiers?.reduce((sum, m) => sum + m.price * m.qty, 0) || 0;
    const basePrice = selectedCartItem.price - currentModifiersTotal;

    updateModifiers(selectedCartItem.id, modifiers, basePrice);
    setModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-2 p-2">

      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-3">
        <div className="flex flex-col gap-3">
          {items.length > 0 ? (
            items.map((item) => (
              <CardDineIn
                key={item.id}
                menu={item.name}
                quantity={item.quantity}
                price={item.price}
                modifiers={item.modifiers}
                onIncrement={() => increment(item.id)}
                onDecrement={() => decrement(item.id)}
                onRemove={() => remove(item.id)}
                onClick={() => handleCardClick(item)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <img
                src={EmptyCart}
                alt="Empty cart"
                className="w-full h-full opacity-80 mb-3"
              />
              <h2 className="text-muted-foreground text-sm">
                Your Cart Is Empty
              </h2>
              <h1 className="text-accent text-sm">
                Let’s get your order started!
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Product Tag Group Modal */}
      {selectedCartItem && selectedCartItem.product_id && (
        <ProductTagGroupModal
          open={modalOpen}
          productId={selectedCartItem.product_id}
          productName={selectedCartItem.name}
          productPrice={selectedCartItem.price - (selectedCartItem.modifiers?.reduce((sum, m) => sum + m.price * m.qty, 0) || 0)}
          onClose={() => setModalOpen(false)}
          onConfirm={handleModalConfirm}
          initialModifiers={selectedCartItem.modifiers}
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default BoardContentDineIn;
