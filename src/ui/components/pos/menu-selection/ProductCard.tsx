
interface ProductProps {
  name: string;
  price: number;
  image: string;
  onClick?: () => void;
}

export default function ProductCard({
  name,
  price,
  image,
  onClick,
}: ProductProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl shadow-sm 
                 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] "
    >
      <div className="relative h-26 w-full rounded-t-1xl overflow-hidden bg-gray-100  ">
        <img
          src={image }
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

 
      <div className="relative bg-primary text-background px-4 py-3 h-20 flex flex-col justify-between rounded-b-2xl">
        {/* Product Name */}
        <h3 className="text-sm font-semibold  ">
          {name}
        </h3>


        <span className="absolute bottom-1 right-1 text-background px-3 py-1 rounded-lg text-sm font-bold shadow">
          ${price.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
