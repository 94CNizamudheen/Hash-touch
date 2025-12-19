import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import EmptyCartImage from "@/assets/empty-cart.png";
import { CartItem } from "@db/types";

interface CartProps {
  items: CartItem[];
  onUpdatequantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  onSettle: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Cart = ({
  items,
  onUpdatequantity,
  onRemoveItem,
  onClear,
  onSettle,
  isOpen = true,
  onClose,
}: CartProps) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;
  const isEmpty = items.length === 0;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Cart Drawer */}
      <div
        className={`flex flex-col bg-white border-2 w-72 sm:w-80 md:w-72 lg:w-80 h-screen md:h-full md:block md:static md:translate-x-0
          ${
            isOpen
              ? "fixed right-0 top-0 z-50 translate-x-0 transition-transform duration-300 ease-in-out"
              : "hidden md:block"
          }
        `}
      >
        {/* Mobile header */}
        <div className="md:hidden flex justify-between items-center p-3 border-b bg-blue-50">
          <div className="font-semibold text-lg">Your Cart</div>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Main Cart Area */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center flex-1 h-full p-6 text-center space-y-3 transition-all duration-300 ease-in-out">
            <img
              src={EmptyCartImage}
              alt="Empty Cart"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-80"
            />
            <div className="font-semibold text-base sm:text-lg">
              Your Cart Is Empty
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Let's get your order started!
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Scrollable item list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-md p-3 bg-gray-50 hover:border-blue-500 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 text-red-500 hover:text-red-700"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        onUpdatequantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="px-2 text-sm font-semibold">
                      {item.quantity}
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        onUpdatequantity(item.id, item.quantity + 1)
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed summary footer */}
            <div className="p-4 border-t bg-white sticky bottom-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button onClick={onSettle} className="flex-1">
                  Settle
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={onClear}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
