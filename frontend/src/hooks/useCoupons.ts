import { useState, useEffect } from 'react'
import type { Coupon } from '../types'

interface UseCouponsReturn {
  coupons: Coupon[]
  isLoading: boolean
  error: string | null
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
      .then((data) => {
        if (!cancelled) {
          setCoupons(data)
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
