import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Container } from '../components/layout/container'
import { Button } from '../components/ui/button'
import { OrderSummary } from '../components/checkout/order-summary'
import { ShippingForm } from '../components/checkout/shipping-form'
import { PaymentSelector } from '../components/payment/payment-selector'
import { CouponInput } from '../components/coupon/coupon-input'
import { useCart } from '../context/CartContext'
import type { Address, PaymentMethod } from '../types'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, discount, shipping, total, couponCode, appliedCoupon, clearCart } = useCart()
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [shippingAddress, setShippingAddress] = useState<Address>({
    id: '', fullName: '', phone: '', email: '',
    address: '', city: '', state: '', postcode: '', isDefault: true,
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({ type: 'ewallet', provider: 'tng' })
  const [placing, setPlacing] = useState(false)

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild variant="outline"><Link to="/products">Browse Products</Link></Button>
      </Container>
    )
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            productImage: i.productImage,
            price: i.price,
            quantity: i.quantity,
          })),
          subtotal,
          discount,
          shipping,
          total,
          couponCode,
          discountTarget: appliedCoupon?.discount?.target || 'base_price',
          paymentMethod,
          shippingAddress,
        }),
      })
      const order = await res.json()
      clearCart()
      navigate(`/checkout/success?id=${order.id}`)
    } catch {
      alert('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="flex items-center gap-2 mb-8 text-xs sm:text-sm flex-wrap">
        {(['shipping', 'payment', 'review'] as const).map((s, i) => (
          <span key={s} className={`flex items-center gap-2 ${step === s ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step === s ? 'bg-primary text-primary-foreground' : 'bg-surface'}`}>
              {i + 1}
            </span>
            {s === 'shipping' ? 'Shipping' : s === 'payment' ? 'Payment' : 'Review'}
            {i < 2 && <span className="text-muted-foreground ml-2 hidden sm:inline">—</span>}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {step === 'shipping' && (
            <div className="bg-surface rounded-radius p-4 sm:p-6">
              <ShippingForm values={shippingAddress} onChange={setShippingAddress} />
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep('payment')}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-surface rounded-radius p-4 sm:p-6">
              <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
              <div className="mt-6 flex justify-between gap-2">
                <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
                <Button onClick={() => setStep('review')}>Review Order</Button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="bg-surface rounded-radius p-4 sm:p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Shipping Address</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {shippingAddress.fullName}<br />
                  {shippingAddress.address}, {shippingAddress.city}<br />
                  {shippingAddress.state} {shippingAddress.postcode}<br />
                  {shippingAddress.phone}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground">
                  {paymentMethod.type === 'ewallet' ? `E-Wallet (${paymentMethod.provider})` :
                   paymentMethod.type === 'duitnow' ? 'DuitNow QR' : 'Credit/Debit Card'}
                </p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                <Button onClick={handlePlaceOrder} disabled={placing} size="lg">
                  {placing ? 'Placing Order...' : `Place Order — RM${total.toFixed(2)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24 lg:self-start order-first lg:order-none">
          <OrderSummary />
          <CouponInput />
        </div>
      </div>
    </Container>
  )
}
