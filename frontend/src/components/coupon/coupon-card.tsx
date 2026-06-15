import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import type { Coupon, CouponValidation } from '../../types'
import { Button } from '../ui/button'
import { useCart } from '../../context/CartContext'

interface CouponCardProps {
  coupon: Coupon
  onApply?: (code: string) => void
}

export function CouponCard({ coupon, onApply }: CouponCardProps) {
  const { subtotal, items, applyCoupon, couponCodes } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEligible = !coupon.minPurchase || subtotal >= coupon.minPurchase
  const isExpired = new Date(coupon.expiresAt) < new Date()
  const isAlreadyApplied = couponCodes.includes(coupon.code)

  const discountLabel =
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `RM${coupon.discountValue} OFF`

  const handleApply = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: coupon.code,
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
        applyCoupon(coupon.code, data)
        onApply?.(coupon.code)
      } else {
        setError(data.errors?.message || 'Coupon cannot be applied')
      }
    } catch {
      setError('Failed to apply coupon. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex flex-col gap-2 rounded-radius border p-4 transition-colors ${
      isEligible && !isExpired
        ? 'border-border'
        : 'border-border opacity-60'
    } ${isAlreadyApplied ? 'border-success/40 bg-success/5' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold font-mono">{coupon.code}</span>
            {!isEligible && <span className="text-xs text-warning">Locked</span>}
            {isExpired && <span className="text-xs text-error">Expired</span>}
            {isAlreadyApplied && (
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Applied
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{coupon.description}</p>
          <p className="text-xs text-muted-foreground">
            {discountLabel}
            {coupon.minPurchase && ` • Min. RM${coupon.minPurchase.toFixed(2)}`}
          </p>
        </div>

        {isEligible && !isExpired && !isAlreadyApplied && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleApply}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply'}
          </Button>
        )}

        {isAlreadyApplied && (
          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
        )}
      </div>

      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  )
}
