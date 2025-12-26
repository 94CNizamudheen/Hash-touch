"use client"

interface ProductProps {
  name: string
  price: number
  image?: string
  onClick?: () => void
}

export default function ProductCard({ name, price, image, onClick }: ProductProps) {
  const hasImage = image && image !== ""

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col cursor-pointer overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.95] min-h-[110px]"
    >
      {hasImage && (
        <div className="aspect-[3] w-full overflow-hidden bg-gray-50 border-b border-gray-100">
          <img
            src={image }
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-2">
        <p className="text-[13px] font-medium leading-tight text-gray-800 line-clamp-2 mb-0.5">{name}</p>

        <div className="mt-auto flex justify-end">
          <span className="text-[14px] font-bold text-[#1e6efd]">{price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
