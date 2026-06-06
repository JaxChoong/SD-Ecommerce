import { useCart } from '../../context/CartContext'
import { ImageWithFallback } from '../common/image-with-fallback'
import { PricingSummary } from '../common/pricing-summary'

export function OrderSummary() {
  const { items, subtotal, discount, shippingDiscount, shipping, total, couponCode } = useCart()

  return (
    <div className="bg-surface rounded-radius p-6 space-y-4">
      <h3 className="font-semibold leading-relaxed">Order Summary</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-radius bg-surface-raised">
              <ImageWithFallback
                src={item.productImage}
                alt={item.productName}
                className="h-full w-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed truncate">{item.productName}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              <p className="text-sm font-medium">RM{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
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
