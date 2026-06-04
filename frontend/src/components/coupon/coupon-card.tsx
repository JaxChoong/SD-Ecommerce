import type { Coupon } from '../../types'
import { Button } from '../ui/button'
import { useCart } from '../../context/CartContext'

interface CouponCardProps {
  coupon: Coupon
  onApply?: () => void
}

export function CouponCard({ coupon, onApply }: CouponCardProps) {
  const { subtotal } = useCart()

  const isEligible = !coupon.minPurchase || subtotal >= coupon.minPurchase
  const isExpired = new Date(coupon.expiresAt) < new Date()

  const discountLabel =
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `RM${coupon.discountValue} OFF`

  return (
    <div className={`flex items-center justify-between rounded-radius border p-4 ${
      isEligible && !isExpired ? 'border-border' : 'border-border opacity-60'
    }`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{coupon.code}</span>
          {!isEligible && <span className="text-xs text-warning">Locked</span>}
          {isExpired && <span className="text-xs text-error">Expired</span>}
        </div>
        <p className="text-xs text-muted-foreground">{coupon.description}</p>
        <p className="text-xs text-muted-foreground">{discountLabel}
          {coupon.minPurchase && ` • Min. RM${coupon.minPurchase.toFixed(2)}`}
        </p>
      </div>
      {isEligible && !isExpired && (
        <Button
          size="sm"
          variant="outline"
          onClick={onApply}
        >
          Apply
        </Button>
      )}
    </div>
  )
}
