import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useCart } from '../../context/CartContext'
import type { CouponValidation } from '../../types'

export function CouponInput() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { subtotal, items, applyCoupon, appliedCoupons, removeCoupon } = useCart()

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      // Send items so the backend Observer can compute category-aware discounts
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          cartTotal: subtotal,
          items: items.map((i) => ({
            productId: i.productId,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      })
      const data: CouponValidation = await res.json()
      if (data.isValid) {
        applyCoupon(code.trim().toUpperCase(), data)
        setCode('')
      } else {
        setError(data.errors?.message || 'Invalid coupon')
      }
    } catch {
      setError('Failed to validate coupon')
    } finally {
      setLoading(false)
    }
  }

  const validAppliedCoupons = appliedCoupons.filter((c) => c.isValid)

  return (
    <div className="space-y-4">
      {validAppliedCoupons.length > 0 && (
        <div className="space-y-2">
          {validAppliedCoupons.map((applied) => {
            const disc = applied.discount
            const isShipping = disc?.target === 'shipping'
            const label = isShipping
              ? `Free shipping (-RM${disc?.appliedAmount.toFixed(2)})`
              : `-RM${disc?.appliedAmount.toFixed(2)}`

            return (
              <div key={applied.code} className="flex items-center justify-between bg-success/10 rounded-radius px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-success leading-relaxed">
                    <span className="font-mono mr-1">{applied.code}</span>applied!
                  </p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
                <button
                  onClick={() => removeCoupon(applied.code)}
                  className="text-sm text-muted-foreground hover:text-error underline"
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium leading-relaxed">Have a coupon code?</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
          <Button onClick={handleApply} disabled={loading || !code.trim()}>
            {loading ? '...' : 'Apply'}
          </Button>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    </div>
  )
}
