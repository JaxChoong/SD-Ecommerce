import { useState } from 'react'
import { ImageWithFallback } from '../common/image-with-fallback'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-radius bg-surface">
        <ImageWithFallback
          src={images[selected] || '/placeholder.svg'}
          alt={`${productName} - Image ${selected + 1}`}
          className="h-full w-full"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-radius border-2 transition-colors ${
                i === selected ? 'border-foreground' : 'border-transparent'
              }`}
            >
              <ImageWithFallback
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
