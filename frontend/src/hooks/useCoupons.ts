import { useState, useEffect } from 'react'
import type { Coupon } from '../types'

interface UseCouponsReturn {
  coupons: Coupon[]
  isLoading: boolean
  error: string | null
}

interface ApiCoupon {
  id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  category: string
  expiresAt: string
  isActive: boolean
  discountTarget: 'base_price' | 'shipping'
  usageCount: number
  usageLimit?: number | null
}

export function useCoupons(): UseCouponsReturn {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch('/api/coupons')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch coupons')
        return res.json()
      })
      .then((data: ApiCoupon[]) => {
        if (!cancelled) {
          const mapped: Coupon[] = data.map((c) => ({
            id: c.id,
            code: c.code,
            description: c.description,
            discountType: c.discountType,
            discountValue: c.discountValue,
            expiresAt: c.expiresAt,
            isActive: c.isActive,
            discountTarget: c.discountTarget,
            usageCount: c.usageCount ?? 0,
            usageLimit: c.usageLimit ?? undefined,
          }))
          setCoupons(mapped)
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
  }, [])

  return { coupons, isLoading, error }
}

