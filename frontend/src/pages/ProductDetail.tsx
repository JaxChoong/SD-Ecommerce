import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Container } from '../components/layout/container'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { PriceDisplay } from '../components/common/price-display'
import { QuantitySelector } from '../components/common/quantity-selector'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setIsLoading(true)
    fetch(`/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) { setProduct(data); setIsLoading(false) }
      })
      .catch(() => { if (!cancelled) { setProduct(null); setIsLoading(false) } })
    return () => { cancelled = true }
  }, [slug])

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity,
    })
  }

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-radius" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Container>
    )
  }

  if (!product) {
    return (
      <Container className="py-16 text-center">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Button asChild variant="outline"><Link to="/products">Browse Products</Link></Button>
      </Container>
    )
  }

  return (
    <Container className="py-6 sm:py-8">
      <nav className="mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2">
        <div className="aspect-square bg-surface rounded-radius overflow-hidden">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            {product.isNew && <Badge variant="primary">New</Badge>}
            {product.originalPrice != null && product.originalPrice > product.price && (
              <Badge variant="error">Sale</Badge>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>
          <PriceDisplay price={product.price} originalPrice={product.originalPrice} className="text-lg" />
          <p className="text-muted-foreground leading-relaxed mt-4 mb-6 text-sm sm:text-base">{product.description}</p>

          <div className="border-t border-border pt-6 mt-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm">Quantity</span>
              <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={product.stock} />
              <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
            </div>
            <Button size="lg" className="w-full" onClick={handleAddToCart}>
              Add to Cart — RM{(product.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
