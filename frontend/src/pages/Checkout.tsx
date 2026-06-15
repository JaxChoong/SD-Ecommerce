import { useState, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router'
import { Container } from '../components/layout/container'
import { Button } from '../components/ui/button'
import { ShippingForm, isCustomerValid } from '../components/checkout/shipping-form'
import { PaymentSelector } from '../components/payment/payment-selector'
import { detectCardType } from '../components/payment/credit-card-form'
import { CouponInput } from '../components/coupon/coupon-input'
import { useCart } from '../context/CartContext'
import type { Customer, PaymentMethod, PaymentMethodType, CardFormValues } from '../types'

async function processCheckout(payload: {
  customer: Customer
  items: { productId: string; quantity: number; unitPrice: number }[]
  paymentMethod: { type: PaymentMethodType; provider?: string; bank?: string }
  amount: number
  couponCode?: string
}) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Backend responded ${res.status}`)
  }
  return await res.json()
}

const EMPTY_CUSTOMER: Customer = { name: '', email: '', phone: '', shoppingAddress: '' }

export default function Checkout() {
  const navigate = useNavigate()
  const { items, clearCart, subtotal, shipping, discount, shippingDiscount, total, couponCode, couponCodes } = useCart()

  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({ type: 'ewallet', provider: 'tng' })
  const [cardForm, setCardForm] = useState<CardFormValues>({ number: '', holder: '', expiry: '' })
  const [creditCardValid, setCreditCardValid] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShippingErrors, setShowShippingErrors] = useState(false)

  const customerValid = useMemo(() => isCustomerValid(customer), [customer])

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
    if (!customerValid) {
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
      const payload = {
        customer,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        paymentMethod: {
          type: paymentMethod.type,
          provider: 'provider' in paymentMethod ? paymentMethod.provider : undefined,
          bank: 'bank' in paymentMethod ? paymentMethod.bank : undefined,
        },
        amount: total,
        ...(couponCode ? { couponCode } : {}),
        couponCodes,
      }
      const result = await processCheckout(payload)
      const orderId = result?.payment?.transactionId || result?.orderId || `ORD-${Date.now().toString().slice(-6)}`
      clearCart()
      navigate(`/checkout/success?id=${orderId}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to place order. Please try again.')
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
                values={customer}
                onChange={setCustomer}
              />
              {showShippingErrors && !customerValid && (
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
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {customer.name}<br />
                  {customer.shoppingAddress}<br />
                  {customer.phone} • {customer.email}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground">{paymentLabel}</p>
                {paymentMethod.type === 'credit_card' && cardForm.number && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {detectCardType(cardForm.number)} •••• {cardForm.number.replace(/\D/g, '').slice(-4)}
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

        {/* ── Order Summary Sidebar ── */}
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

            {/* Coupon input */}
            <div className="border-t border-border pt-3">
              <CouponInput />
            </div>

            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>RM{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>
                    Coupon discount
                    {couponCode && <span className="ml-1 font-mono text-xs">({couponCode})</span>}
                  </span>
                  <span>-RM{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0
                    ? shippingDiscount > 0
                      ? <span className="text-success">Free <span className="line-through text-muted-foreground text-xs">RM{(shipping + shippingDiscount).toFixed(2)}</span></span>
                      : 'Free'
                    : `RM${shipping.toFixed(2)}`}
                </span>
              </div>
              {shippingDiscount > 0 && shipping > 0 && (
                <div className="flex justify-between text-success text-xs">
                  <span>Shipping discount</span>
                  <span>-RM{shippingDiscount.toFixed(2)}</span>
                </div>
              )}
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

