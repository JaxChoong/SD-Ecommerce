import { useCart } from '../../context/CartContext'
import { PricingSummary } from '../common/pricing-summary'

export function CartSummary() {
  const { subtotal, discount, shippingDiscount, shipping, total, couponCode } = useCart()

  return (
    <div className="bg-surface rounded-radius p-6 space-y-3">
      <h3 className="font-semibold leading-relaxed">Order Summary</h3>
      <PricingSummary
        subtotal={subtotal}
        discount={discount}
        shippingDiscount={shippingDiscount}
        shipping={shipping}
        total={total}
        couponCode={couponCode}
      />
    </div>
  )
}
