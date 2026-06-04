import { Link } from 'react-router'
import type { Product } from '../../types'
import { PriceDisplay } from '../common/price-display'
import { ImageWithFallback } from '../common/image-with-fallback'
import { Button } from '../ui/button'
import { useCart } from '../../context/CartContext'
import { Badge } from '../ui/badge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: 1,
    })
  }

  return (
    <div className="group flex flex-col bg-surface rounded-radius overflow-hidden">
      <Link to={`/products/${product.slug}`} className="relative aspect-square overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="h-full w-full transition-transform group-hover:scale-105"
        />
        {product.isNew && (
          <Badge variant="primary" className="absolute top-2 left-2">
            New
          </Badge>
        )}
        {product.originalPrice != null && product.originalPrice > product.price && (
          <Badge variant="error" className="absolute top-2 right-2">
            Sale
          </Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium leading-relaxed group-hover:text-[#DA3A2F] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="mt-auto pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <PriceDisplay price={product.price} originalPrice={product.originalPrice} />
          <Button size="sm" onClick={handleAddToCart} className="w-full sm:w-auto">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
