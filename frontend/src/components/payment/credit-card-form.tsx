import { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'

interface CreditCardFormProps {
  onSaveCard?: (saved: boolean) => void
}

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 13) return false
  let sum = 0
  let alternate = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}

function detectCardType(number: string): string {
  const cleaned = number.replace(/\D/g, '')
  if (/^4/.test(cleaned)) return 'Visa'
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard'
  if (/^3[47]/.test(cleaned)) return 'Amex'
  return ''
}

function validateExpiry(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const month = parseInt(match[1], 10)
  const year = parseInt(match[2], 10) + 2000
  if (month < 1 || month > 12) return false
  const now = new Date()
  const expiry = new Date(year, month, 0)
  return expiry >= now
}

export function CreditCardForm({ onSaveCard }: CreditCardFormProps) {
  const [number, setNumber] = useState('')
  const [holder, setHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const cardType = detectCardType(number)
  const isLuhnValid = number.replace(/\D/g, '').length >= 13 ? luhnCheck(number) : true

  const formatNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handleBlur = () => {
    const errs: Record<string, string> = {}
    if (number.replace(/\D/g, '').length >= 13 && !isLuhnValid) {
      errs.number = 'Invalid card number'
    }
    if (expiry.length === 5 && !validateExpiry(expiry)) {
      errs.expiry = 'Invalid or expired'
    }
    if (cvv.length > 0 && (cvv.length < 3 || cvv.length > 4)) {
      errs.cvv = 'Invalid CVV'
    }
    setErrors(errs)
  }

  return (
    <div className="space-y-4 mt-3">
      <div className="space-y-2">
        <Label htmlFor="card-number">Card Number</Label>
        <Input
          id="card-number"
          placeholder="1234 5678 9012 3456"
          value={number}
          onChange={(e) => setNumber(formatNumber(e.target.value))}
          onBlur={handleBlur}
          className={errors.number ? 'border-error' : ''}
        />
        {cardType && <p className="text-xs text-muted-foreground">{cardType}</p>}
        {errors.number && <p className="text-xs text-error">{errors.number}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-holder">Cardholder Name</Label>
        <Input
          id="card-holder"
          placeholder="Full name on card"
          value={holder}
          onChange={(e) => setHolder(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
          <Input
            id="card-expiry"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            onBlur={handleBlur}
            maxLength={5}
            className={errors.expiry ? 'border-error' : ''}
          />
          {errors.expiry && <p className="text-xs text-error">{errors.expiry}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="card-cvv">CVV</Label>
          <Input
            id="card-cvv"
            type="password"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onBlur={handleBlur}
            maxLength={4}
            className={errors.cvv ? 'border-error' : ''}
          />
          {errors.cvv && <p className="text-xs text-error">{errors.cvv}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="save-card"
          checked={saveCard}
          onCheckedChange={(c) => {
            setSaveCard(c === true)
            onSaveCard?.(c === true)
          }}
        />
        <Label htmlFor="save-card" className="text-sm font-normal">Save card for future purchases</Label>
      </div>
    </div>
  )
}
