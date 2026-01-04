
interface ProductProps {
  name: string
  price: number
  image?: string
  onClick?: () => void
}

export default function ProductCard({
  name,
  price,
  image,
  onClick,
}: ProductProps) {
  const hasImage = Boolean(image)

  return (
    <div
      onClick={onClick}

    >
      <div className="rounded-xl p-0 pb-2 bg-secondary border border-border shadow-sm cursor-pointer flex flex-col relative hover:shadow-md transition-shadow h-full">
        
        {/* ================= IMAGE MODE (image-1) ================= */}
        {hasImage && (
          <>
            <img
              src={image}
              alt="product"
              loading="lazy"
              className="w-full max-h-[100px] object-cover rounded-t-xl"
            />

            <div className="px-3 w-full flex flex-col h-full py-2">
              <p
                className="font-bold line-clamp-2 flex-1 text-sm text-start"
                style={{ color: "rgb(17, 24, 39)" }}
              >
                {name}
              </p>

              <div className="w-full flex justify-end pt-2">
                <p className="font-bold text-sm text-primary">
                 S$ {price.toFixed(2)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ================= NO IMAGE MODE (image-2) ================= */}
        {!hasImage && (
          <div className="px-3 w-full flex flex-col h-full py-2 justify-center">
            <p
              className="font-bold line-clamp-2 flex-1 text-sm text-start"
              style={{ color: "rgb(17, 24, 39)" }}
            >
              {name}
            </p>

            <div className="w-full flex justify-end pt-2">
              <p className="font-bold text-sm text-primary">
               S$ {price.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
