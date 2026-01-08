import { useSetup } from "@/ui/context/SetupContext";
interface CartCardProps {
  name: string;
  quantity: number;
  price: number;
  modifiers?: { name: string; qty: number; price: number }[];
}

export default function CartCard({
  name,
  quantity,
  price,
  modifiers,
}: CartCardProps) {
  // Calculate total including modifiers
  const modifiersTotal = modifiers?.reduce((sum, mod) => sum + (mod.price * mod.qty), 0) || 0;
  const itemTotal = price + modifiersTotal;
  const total = quantity * itemTotal;
  const {currencyCode}=useSetup()

  return (
    <div className="rounded-xl border border-border bg-secondary p-4 shadow-sm">
      <div className="flex gap-4">
        {/* Quantity badge */}
        <div className="rounded-lg bg-accent-foreground border border-border text-foreground font-semibold text-lg min-w-[48px] h-12 flex items-center justify-center flex-shrink-0">
          {quantity}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Header: Item name and total price */}
          <div className="flex justify-between items-start gap-4">
            <h3 className=" text-base text-foreground">
              {name}
            </h3>
            <span className="font-bold text-lg text-foreground whitespace-nowrap">
              {currencyCode} {total.toFixed(2)}
            </span>
          </div>

          {/* Modifiers list */}
          {modifiers && modifiers.length > 0 && (
            <div className="space-y-1">
              {modifiers.map((modifier, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-foreground/80">
                    {modifier.name} x {modifier.qty} @ S$ {modifier.price.toFixed(2)}
                  </span>
                  <span className="text-foreground/80 font-medium whitespace-nowrap ml-4">
                    $ {(modifier.price * modifier.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}