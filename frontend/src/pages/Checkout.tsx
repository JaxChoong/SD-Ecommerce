import { useState, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router'
import { Container } from '../components/layout/container'
import { Button } from '../components/ui/button'
import { ShippingForm, isShippingValid } from '../components/checkout/shipping-form'
import { PaymentSelector } from '../components/payment/payment-selector'
import { detectCardType } from '../components/payment/credit-card-form'
import type { Address, PaymentMethod, PaymentMethodType, CardFormValues } from '../types'

interface PlaceholderCartItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
}

// TODO: Replace with API call, e.g.:
//   const PLACEHOLDER_CART = await fetch('/api/cart').then(r => r.json())
const PLACEHOLDER_CART: PlaceholderCartItem[] = [
  { id: 'p1', productId: 'placeholder-1', productName: 'Linen Button-Up Shirt',  productImage: '/placeholder.svg', price: 89.90, quantity: 1 },
  { id: 'p2', productId: 'placeholder-2', productName: 'Cotton Crew T-Shirt',    productImage: '/placeholder.svg', price: 39.90, quantity: 2 },
  { id: 'p3', productId: 'placeholder-3', productName: 'Slim-Fit Chino Pants',   productImage: '/placeholder.svg', price: 119.00, quantity: 1 },
]

const FREE_SHIPPING_THRESHOLD = 200
const FLAT_SHIPPING_FEE = 10

const fallbackStrategies: Record<PaymentMethodType, (amount: number) => Promise<{ success: boolean; method: PaymentMethodType; transaction_id: string; amount: number }>> = {
  ewallet:        (amount) => new Promise((resolve) => setTimeout(() => resolve({ success: true, method: 'ewallet',        transaction_id: `LOCAL-${Math.random().toString(16).slice(2, 10).toUpperCase()}`, amount }),  800)),
  credit_card:    (amount) => new Promise((resolve) => setTimeout(() => resolve({ success: true, method: 'credit_card',    transaction_id: `LOCAL-${Math.random().toString(16).slice(2, 10).toUpperCase()}`, amount }), 1200)),
  online_banking: (amount) => new Promise((resolve) => setTimeout(() => resolve({ success: true, method: 'online_banking', transaction_id: `LOCAL-${Math.random().toString(16).slice(2, 10).toUpperCase()}`, amount }), 1500)),
}

async function processPayment(method: PaymentMethod, amount: number) {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method: method.type, provider: 'provider' in method ? method.provider : undefined, bank: 'bank' in method ? method.bank : undefined }),
    })
    if (!res.ok) throw new Error(`Backend responded ${res.status}`)
    return await res.json()
  } catch {
    return fallbackStrategies[method.type](amount)
  }
}

export default function Checkout() {
  const navigate = useNavigate()

  const items = PLACEHOLDER_CART
  const subtotal = useMemo(
    () => Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,
    [items],
  )
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE
  const total = Math.round((subtotal + shipping) * 100) / 100

  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [shippingAddress, setShippingAddress] = useState<Address>({
    id: '', fullName: '', phone: '', email: '',
    address: '', city: '', state: '', postcode: '', isDefault: true,
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({ type: 'ewallet', provider: 'tng' })
  const [cardForm, setCardForm] = useState<CardFormValues>({ number: '', holder: '', expiry: '', saveCard: false })
  const [creditCardValid, setCreditCardValid] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShippingErrors, setShowShippingErrors] = useState(false)

  const shippingValid = useMemo(() => isShippingValid(shippingAddress), [shippingAddress])

  const handleCreditCardValidity = useCallback((valid: boolean) => {
    setCreditCardValid(valid)
  }, [])

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild variant="outline"><Link to="/products">Browse Products</Link></Button>
      </Container>
    )
  }

  const handleContinueToPayment = () => {
    if (!shippingValid) {
      setShowShippingErrors(true)
      return
    }
    setShowShippingErrors(false)
    setStep('payment')
  }

  const handleContinueToReview = () => {
    if (paymentMethod.type === 'credit_card' && !creditCardValid) {
      return
    }
    setStep('review')
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    setError(null)
    try {
      const result = await processPayment(paymentMethod, total)
      if (!result.success) {
        setError('Payment failed. Please try again.')
        return
      }

      // Post-payment "Observer" side effect: persist the card if the user opted in.
      // Failure here is non-critical (the order is already paid) — log and continue.
      if (paymentMethod.type === 'credit_card' && cardForm.saveCard) {
        try {
          const existing = await fetch('/api/saved-payment-methods')
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => [])
          const hasDefault = Array.isArray(existing) && existing.some((c: { isDefault?: boolean; is_default?: boolean }) => Boolean(c.isDefault ?? c.is_default))

          const brand = detectCardType(cardForm.number)
          const last4 = cardForm.number.replace(/\D/g, '').slice(-4)

          await fetch('/api/saved-payment-methods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              brand,
              last4,
              expiry: cardForm.expiry,
              holder: cardForm.holder.trim(),
              is_default: !hasDefault,
            }),
          })
        } catch (e) {
          console.warn('Could not save card:', e)
        }
      }

      const orderId = result.transaction_id || `ORD-${Date.now().toString().slice(-6)}`
      navigate(`/checkout/success?id=${orderId}`)
    } catch {
      setError('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  const paymentLabel = (() => {
    if (paymentMethod.type === 'ewallet') {
      const labels: Record<string, string> = { tng: 'Touch \'n Go', grabpay: 'GrabPay', boost: 'Boost', shopeepay: 'ShopeePay' }
      return `E-Wallet (${labels[paymentMethod.provider] || paymentMethod.provider})`
    }
    if (paymentMethod.type === 'online_banking') {
      const labels: Record<string, string> = {
        maybank: 'Maybank2u', cimb: 'CIMB Clicks', public_bank: 'Public Bank', rhb: 'RHB Now',
        hong_leong: 'Hong Leong Connect', ambank: 'AmBank', bank_rakyat: 'Bank Rakyat', bsn: 'BSN MyRinggit',
      }
      return `Online Banking (${labels[paymentMethod.bank] || paymentMethod.bank})`
    }
    return 'Credit Card'
  })()

  const canReview = paymentMethod.type !== 'credit_card' || creditCardValid

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
            <div className="bg-surface rounded-radius p-4 sm:p-6 space-y-4">
              <ShippingForm
                values={shippingAddress}
                onChange={setShippingAddress}
                showErrors={showShippingErrors}
              />
              {showShippingErrors && !shippingValid && (
                <p className="text-sm text-error" role="alert">
                  Please fix the highlighted fields before continuing.
                </p>
              )}
              <div className="flex justify-end">
                <Button onClick={handleContinueToPayment}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-surface rounded-radius p-4 sm:p-6">
              <PaymentSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
                cardValues={cardForm}
                onCardChange={setCardForm}
                onCreditCardValidityChange={handleCreditCardValidity}
              />
              <div className="mt-6 flex justify-between gap-2">
                <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
                <Button onClick={handleContinueToReview} disabled={!canReview}>
                  Review Order
                </Button>
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
                  {shippingAddress.phone} • {shippingAddress.email}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground">{paymentLabel}</p>
                {paymentMethod.type === 'credit_card' && cardForm.number && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {detectCardType(cardForm.number)} •••• {cardForm.number.replace(/\D/g, '').slice(-4)}
                    {cardForm.saveCard && ' • will be saved'}
                  </p>
                )}
              </div>
              {error && (
                <p className="text-sm text-error" role="alert">{error}</p>
              )}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                <Button onClick={handlePlaceOrder} disabled={placing} size="lg">
                  {placing ? 'Processing Payment...' : `Pay Now — RM${total.toFixed(2)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24 lg:self-start order-first lg:order-none">
          <div className="bg-surface rounded-radius p-6 space-y-4">
            <h3 className="font-semibold leading-relaxed">Order Summary</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-radius bg-surface-raised">
                    <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium">RM{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>RM{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `RM${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <span>Total</span>
                <span>RM{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
