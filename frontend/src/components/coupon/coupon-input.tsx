import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useCart } from '../../context/CartContext'
import type { CouponValidation } from '../../types'

export function CouponInput() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { subtotal, applyCoupon, appliedCoupon, removeCoupon } = useCart()

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), cartTotal: subtotal }),
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

  if (appliedCoupon?.isValid) {
    return (
      <div className="flex items-center justify-between bg-success/10 rounded-radius px-4 py-3">
        <div>
          <p className="text-sm font-medium text-success leading-relaxed">
            Coupon applied!
          </p>
          <p className="text-xs text-muted-foreground">
            -RM{appliedCoupon.discount?.appliedAmount.toFixed(2)}
          </p>
        </div>
        <button
          onClick={removeCoupon}
          className="text-sm text-muted-foreground hover:text-error underline"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
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
  )
}
