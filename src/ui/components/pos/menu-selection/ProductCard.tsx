
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
      className="group rounded-2xl hover:shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border border-gray-200  bg-white"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={image || "/placeholder.svg?height=200&width=300"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="bg-blue-600 text-white p-4 h-32 rounded-b-2xl flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="text-sm sm:text-base font-bold line-clamp-1 flex-1 group-hover:text-blue-100 transition-colors">
            {name}
          </div>
          <div className="flex-shrink-0 bg-white text-blue-600 px-3 py-1 rounded-lg text-sm sm:text-base font-bold shadow-sm">
            ${price.toFixed(2)}
          </div>
        </div>
        

      </div>
    </div>
  );
}
