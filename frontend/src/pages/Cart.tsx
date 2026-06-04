import { Link } from 'react-router'
import { Container } from '../components/layout/container'
import { Button } from '../components/ui/button'
import { CartItem } from '../components/cart/cart-item'
import { CartSummary } from '../components/cart/cart-summary'
import { CartEmpty } from '../components/cart/cart-empty'
import { CouponInput } from '../components/coupon/coupon-input'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <CartEmpty />
      </Container>
    )
  }

  return (
    <Container className="py-6 sm:py-8">
      <h1 className="text-2xl font-semibold mb-6">Shopping Cart</h1>
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <div className="space-y-4">
          <CartSummary />
          <CouponInput />
          <Button asChild className="w-full" size="lg">
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}
