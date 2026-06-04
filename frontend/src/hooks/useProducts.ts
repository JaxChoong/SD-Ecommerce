import { useState, useEffect } from 'react'
import type { Product } from '../types'

interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  onSale?: boolean
  sort?: string
  search?: string
}

interface UseProductsReturn {
  products: Product[]
  isLoading: boolean
  error: string | null
}

export function useProducts(filters: ProductFilters = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))
    if (filters.inStock) params.set('inStock', 'true')
    if (filters.onSale) params.set('onSale', 'true')
    if (filters.sort) params.set('sort', filters.sort)
    if (filters.search) params.set('search', filters.search)

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch(`/api/products?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setProducts(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.onSale,
    filters.sort,
    filters.search,
  ])

  return { products, isLoading, error }
}
