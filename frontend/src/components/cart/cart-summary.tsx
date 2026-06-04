import { useCart } from '../../context/CartContext'
import { Separator } from '../ui/separator'

export function CartSummary() {
  const { subtotal, discount, shipping, total } = useCart()

  return (
    <div className="bg-surface rounded-radius p-6 space-y-3">
      <h3 className="font-semibold leading-relaxed">Order Summary</h3>
      <div className="space-y-2 text-sm">
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
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? 'Free' : `RM${shipping.toFixed(2)}`}</span>
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
