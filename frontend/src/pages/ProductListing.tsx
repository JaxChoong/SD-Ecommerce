import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Container } from '../components/layout/container'
import { ProductGrid } from '../components/product/product-grid'
import { ProductSkeleton } from '../components/product/product-skeleton'
import { ProductFilters } from '../components/product/product-filters'
import { useProducts } from '../hooks/useProducts'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'

const categories = [
  { value: 'all', label: 'All' },
  { value: 'Lighting', label: 'Lighting' },
  { value: 'Home', label: 'Home' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Stationery', label: 'Stationery' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Kitchen', label: 'Kitchen' },
]

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
]

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)

  const category = searchParams.get('category') || undefined
  const sort = searchParams.get('sort') || 'featured'
  const search = searchParams.get('search') || undefined
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const inStock = searchParams.get('inStock') === 'true'
  const onSale = searchParams.get('onSale') === 'true'

  const { products, isLoading } = useProducts({ category, minPrice, maxPrice, inStock, onSale, sort, search })

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params, { replace: true })
  }

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters = !!minPrice || !!maxPrice || inStock || onSale
  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label || 'Sort'

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold mb-1">{search ? `Search: "${search}"` : 'Shop'}</h1>
      <p className="text-sm text-muted-foreground mb-6">{products.length} products</p>

      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateParam('category', cat.value === 'all' ? undefined : cat.value)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors leading-relaxed ${
                (category === cat.value || (!category && cat.value === 'all'))
                  ? 'bg-foreground text-background'
                  : 'bg-surface text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mb-6">
        <div className="relative">
          <button
            onClick={() => { setShowSort(!showSort); setShowFilters(false) }}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm bg-surface text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="hidden sm:inline">Sort:</span>
            {currentSortLabel}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-radius border border-border bg-surface-raised py-1 shadow-lg">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { updateParam('sort', opt.value); setShowSort(false) }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-surface ${
                      sort === opt.value ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => { setShowFilters(!showFilters); setShowSort(false) }}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
            hasActiveFilters
              ? 'bg-foreground text-background'
              : 'bg-surface text-muted-foreground hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px]">
              {(minPrice || maxPrice ? 1 : 0) + (inStock ? 1 : 0) + (onSale ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {minPrice != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs">
              Min: RM{minPrice}
              <button onClick={() => updateParam('minPrice', undefined)} className="hover:text-error"><X className="h-3 w-3" /></button>
            </span>
          )}
          {maxPrice != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs">
              Max: RM{maxPrice}
              <button onClick={() => updateParam('maxPrice', undefined)} className="hover:text-error"><X className="h-3 w-3" /></button>
            </span>
          )}
          {inStock && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs">
              In Stock
              <button onClick={() => updateParam('inStock', undefined)} className="hover:text-error"><X className="h-3 w-3" /></button>
            </span>
          )}
          {onSale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs">
              On Sale
              <button onClick={() => updateParam('onSale', undefined)} className="hover:text-error"><X className="h-3 w-3" /></button>
            </span>
          )}
          <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-1">
            Clear all
          </button>
        </div>
      )}

      {showFilters && (
        <div className="mb-6 bg-surface rounded-radius p-6">
          <ProductFilters
            minPrice={minPrice}
            onMinPriceChange={(p) => updateParam('minPrice', p?.toString())}
            maxPrice={maxPrice}
            onMaxPriceChange={(p) => updateParam('maxPrice', p?.toString())}
            inStock={inStock}
            onInStockChange={(c) => updateParam('inStock', c ? 'true' : undefined)}
            onSale={onSale}
            onOnSaleChange={(c) => updateParam('onSale', c ? 'true' : undefined)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No products found.</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or browse all products.</p>
          <button onClick={clearAllFilters} className="text-sm text-primary underline mt-4">Clear all filters</button>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  )
}
