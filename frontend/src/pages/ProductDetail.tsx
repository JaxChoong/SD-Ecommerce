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
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [prevSlug, setPrevSlug] = useState<string | undefined>(undefined)
  const { addItem } = useCart()

  if (slug !== prevSlug) {
    setPrevSlug(slug)
    setIsLoading(true)
    setQuantity(1)
    setSelectedSize(null)
  }

  useEffect(() => {
    if (!slug) return
    let cancelled = false
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

  // Parse size stocks if it is a JSON string (multiple sizes)
  let parsedSizes: Record<string, number> = {}
  let hasMultipleSizes = false

  if (product && product.size && product.size.trim().startsWith('{')) {
    try {
      parsedSizes = JSON.parse(product.size)
      hasMultipleSizes = true
    } catch (e) {
      console.error('Failed to parse sizes JSON', e)
    }
  }

  const isShoe = product?.category === 'Shoes'

  // Determine availability status
  const sizesList = hasMultipleSizes 
    ? Object.keys(parsedSizes).sort((a, b) => {
        const numA = Number(a)
        const numB = Number(b)
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB
        }
        const clothingOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
        const idxA = clothingOrder.indexOf(a)
        const idxB = clothingOrder.indexOf(b)
        if (idxA !== -1 && idxB !== -1) {
          return idxA - idxB
        }
        return a.localeCompare(b)
      })
    : []
  const allOutOfStock = hasMultipleSizes && (sizesList.length === 0 || sizesList.every(s => (parsedSizes[s] || 0) <= 0))

  // Determine maximum stock available for quantity selector
  const maxStock = hasMultipleSizes
    ? (selectedSize ? (parsedSizes[selectedSize] || 0) : 0)
    : (product ? product.stock : 0)

  // Quantity is clamped inside the size selection onClick handler below to avoid useEffect

  const handleAddToCart = () => {
    if (!product) return
    if (hasMultipleSizes && !selectedSize) {
      alert('Please select a size first.')
      return
    }

    const finalName = hasMultipleSizes
      ? (isShoe ? `${product.name} - EU ${selectedSize}` : `${product.name} - ${selectedSize}`)
      : product.name

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      productName: finalName,
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
            {hasMultipleSizes && (
              <div className="mb-6 space-y-3">
                <span className="text-sm font-semibold block">{isShoe ? 'Select Size (EUR)' : 'Select Size'}</span>
                <div className="flex flex-wrap gap-2">
                  {sizesList.map((size) => {
                    const stock = parsedSizes[size] || 0
                    const isSelected = selectedSize === size
                    const isOutOfStock = stock <= 0

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedSize(size)
                          if (quantity > stock) {
                            setQuantity(Math.max(1, stock))
                          }
                        }}
                        className={`
                          px-4 py-2 text-sm font-medium rounded-radius border transition-all duration-200
                          ${isSelected
                            ? 'bg-primary border-primary text-primary-foreground shadow-md font-semibold'
                            : isOutOfStock
                              ? 'bg-surface/30 border-border/10 text-muted-foreground/30 cursor-not-allowed line-through'
                              : 'bg-surface border-border/40 text-foreground hover:border-foreground/65 hover:bg-surface-raised'
                          }
                        `}
                      >
                        {isShoe ? `EU ${size}` : size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {!hasMultipleSizes && product.size && product.size !== 'One Size' && (
              <div className="mb-6 flex items-center">
                <span className="text-sm font-semibold text-muted-foreground">Size:</span>
                <span className="text-sm font-bold bg-surface px-2.5 py-1.5 rounded-radius border border-border/40 ml-2">
                  {product.size}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm">Quantity</span>
              <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={maxStock || 1} />
              <span className="text-xs text-muted-foreground">
                {hasMultipleSizes ? (
                  selectedSize ? (
                    isShoe ? `${maxStock} in stock for EU ${selectedSize}` : `${maxStock} in stock for Size ${selectedSize}`
                  ) : (
                    'Select a size to view stock'
                  )
                ) : (
                  `${product.stock} in stock`
                )}
              </span>
            </div>
            
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={
                (hasMultipleSizes && !selectedSize) ||
                (hasMultipleSizes && allOutOfStock) ||
                (!hasMultipleSizes && product.stock <= 0)
              }
            >
              {hasMultipleSizes ? (
                allOutOfStock ? (
                  'Out of Stock'
                ) : !selectedSize ? (
                  'Select a Size'
                ) : (
                  `Add to Cart — RM${(product.price * quantity).toFixed(2)}`
                )
              ) : product.stock <= 0 ? (
                'Out of Stock'
              ) : (
                `Add to Cart — RM${(product.price * quantity).toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
