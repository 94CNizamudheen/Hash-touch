
interface CartCardProps {
  name: string;
  quantity: number;
  price: number;
}

export default function CartCard({
  name,
  quantity,
  price,

}: CartCardProps) {
  const total = quantity * price;

  return (
    <div className="rounded-xl border text-card-foreground shadow bg-secondary p-3 select-none">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between gap-3">
          <div className="flex gap-4">
            {/* Quantity badge */}
            <div className="rounded-md border  text-sm font-bold bg-navigation text-accent min-w-12 h-8 flex items-center justify-center hover:bg-accent ">
              {quantity}
            </div>

            {/* Item name */}
            <div className="flex flex-col gap-1 w-full">
              <h3 className="font-medium text-sm md:text-lg text-black">
                {name}
              </h3>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col items-end">
            <p className="font-semibold text-black text-sm md:text-lg">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
