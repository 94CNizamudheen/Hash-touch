
interface ProductProps {
  name: string
  price: number
  image?: string
  isSoldOut?: boolean
  onClick?: () => void
}

export default function ProductCard({ name, price, image, isSoldOut = false, onClick }: ProductProps) {
  const hasImage = Boolean(image)
  const displayPrice = typeof price === "number" ? price : 0

  const handleClick = () => {
    // Don't allow clicking if sold out
    if (isSoldOut) return
    onClick?.()
  }

  return (
    <div onClick={handleClick}>
      <div
        className={`rounded-xl p-0 pb-2 bg-secondary border border-border shadow-sm flex flex-col relative hover:shadow-md transition-shadow h-full ${
          isSoldOut ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {/* ================= IMAGE MODE ================= */}
        {hasImage && (
          <>
            <div className="relative">
              <img
                src={image || "/placeholder.svg"}
                alt="product"
                loading="lazy"
                className={`w-full max-h-[100px] object-cover rounded-t-xl ${isSoldOut ? "grayscale" : ""}`}
              />
              {/* Centered Unavailable badge in image if image exists */}
              {isSoldOut && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="bg-background/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-md border border-border transform -rotate-12">
                    <span className="text-xs font-bold text-destructive uppercase tracking-wide">Unavailable</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-3 w-full flex flex-col h-full py-2">
              <p
                className={`font-bold line-clamp-2 flex-1 text-sm text-start ${
                  isSoldOut ? "text-muted-foreground line-through" : ""
                }`}
                style={!isSoldOut ? { color: "rgb(17, 24, 39)" } : {}}
              >
                {name}
              </p>

              <div className="w-full flex justify-end pt-2">
                <p className={`font-bold text-sm ${isSoldOut ? "text-muted-foreground" : "text-primary"}`}>
                  ${displayPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ================= NO IMAGE MODE ================= */}
        {!hasImage && (
          <div className="px-3 w-full flex flex-col h-full py-2 justify-center relative">
            {/* Centered Unavailable badge in card if no image exists */}
            {isSoldOut && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="bg-background/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-md border border-border transform -rotate-12">
                  <span className="text-xs font-bold text-destructive uppercase tracking-wide">Unavailable</span>
                </div>
              </div>
            )}
            <p
              className={`font-bold line-clamp-2 flex-1 text-sm text-start ${
                isSoldOut ? "text-muted-foreground line-through" : ""
              }`}
              style={!isSoldOut ? { color: "rgb(17, 24, 39)" } : {}}
            >
              {name}
            </p>

            <div className="w-full flex justify-end pt-2">
              <p className={`font-bold text-sm ${isSoldOut ? "text-muted-foreground" : "text-primary"}`}>
                ${displayPrice.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Overlay for sold out effect */}
        {isSoldOut && <div className="absolute inset-0 bg-background/20 rounded-xl pointer-events-none" />}
      </div>
    </div>
  )
}
