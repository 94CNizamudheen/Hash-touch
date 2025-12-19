import CardDineIn from "../card/CardDineIn";
import { useOrder } from "@/ui/context/OrderContext";
import EmptyCart from "@/assets/empty-cart.png";

const BoardContentDineIn = () => {
  const { orderItems, incrementItem, decrementItem, removeItem } = useOrder();

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full h-6 bg-accent-foreground text-navigation px-3 text-xs flex items-center shrink-0">
        Order No: 28890 - Admin
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-3">
        <div className="flex flex-col gap-3">
          {orderItems.length > 0 ? (
            orderItems.map((item) => (
              <CardDineIn
                key={item.id}
                menu={item.name}
                quantity={(item as any).quantity || 1}
                price={item.price}
                onIncrement={() => incrementItem(item.id)}
                onDecrement={() => decrementItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                src={EmptyCart}
                alt="Empty cart"
                className="w-28 h-28 opacity-80 mb-3"
              />
              <p className="text-muted-foreground text-sm">
                No items added yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardContentDineIn;
