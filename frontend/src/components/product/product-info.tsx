import type { Product } from '../../types'
import { PriceDisplay } from '../common/price-display'
import { Badge } from '../ui/badge'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <h1 className="text-2xl font-semibold mt-1 leading-relaxed">{product.name}</h1>
      </div>

      <PriceDisplay price={product.price} originalPrice={product.originalPrice} className="text-xl" />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{product.rating.toFixed(1)}</span>
        <span>&middot;</span>
        <span>{product.reviewCount} reviews</span>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

      <div className="flex items-center gap-2">
        {product.stock > 0 ? (
          <Badge variant="success">In Stock ({product.stock} available)</Badge>
        ) : (
          <Badge variant="error">Out of Stock</Badge>
        )}
        {product.isNew && <Badge variant="primary">New Arrival</Badge>}
      </div>
    </div>
  )
}
