import CardDineIn from "../card/CardDineIn";
import { useCart } from "@/ui/context/CartContext";

import EmptyCart from "@/assets/empty-cart.png";

const BoardContentDineIn = () => {
  const {
    items,
    increment,
    decrement,
    remove,
    isHydrated,
  } = useCart();




  if (!isHydrated) return null;

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
                onIncrement={() => increment(item.id)}
                onDecrement={() => decrement(item.id)}
                onRemove={() => remove(item.id)}
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

     
    </div>
  );
};

export default BoardContentDineIn;
