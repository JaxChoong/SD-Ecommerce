import { useCart } from '../../context/CartContext'
import { Separator } from '../ui/separator'
import { ImageWithFallback } from '../common/image-with-fallback'

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
      <Separator />
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>RM{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount</span>
            <span>-RM{discount.toFixed(2)}</span>
          </div>
        )}
        {shippingDiscount > 0 && (
          <div className="flex justify-between text-success">
            <span>Shipping Discount {couponCode ? `(${couponCode})` : ''}</span>
            <span>-RM{shippingDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {shippingDiscount > 0 ? (
              <>
                <span className="line-through mr-1.5 text-muted-foreground/60">RM{(shipping + shippingDiscount).toFixed(2)}</span>
                {shipping === 0 ? (
                  <span className="text-success font-medium">Free</span>
                ) : (
                  `RM${shipping.toFixed(2)}`
                )}
              </>
            ) : shipping === 0 ? (
              'Free'
            ) : (
              `RM${shipping.toFixed(2)}`
            )}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>RM{total.toFixed(2)}</span>
      </div>
    </div>
  )
}
