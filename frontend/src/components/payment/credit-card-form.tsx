import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'

interface CreditCardFormProps {
  onSaveCard?: (saved: boolean) => void
  onValidityChange?: (isValid: boolean) => void
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

// eslint-disable-next-line react-refresh/only-export-components
export function isCreditCardValid(values: { number: string; holder: string; expiry: string; cvv: string }): boolean {
  const digits = values.number.replace(/\D/g, '')
  if (digits.length < 13 || !luhnCheck(values.number)) return false
  if (values.holder.trim().length < 2) return false
  if (!validateExpiry(values.expiry)) return false
  if (values.cvv.length < 3 || values.cvv.length > 4) return false
  return true
}

export function CreditCardForm({ onSaveCard, onValidityChange }: CreditCardFormProps) {
  const [number, setNumber] = useState('')
  const [holder, setHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const cardType = detectCardType(number)
  const digits = number.replace(/\D/g, '')

  const validate = (vals = { number, holder, expiry, cvv }): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (touched.number || vals.number) {
      if (digits === '') errs.number = 'Card number is required'
      else if (digits.length < 13) errs.number = 'Card number is too short'
      else if (!luhnCheck(vals.number)) errs.number = 'Invalid card number'
    }
    if (touched.holder || vals.holder) {
      if (!vals.holder.trim()) errs.holder = 'Cardholder name is required'
      else if (vals.holder.trim().length < 2) errs.holder = 'Name is too short'
    }
    if (touched.expiry || vals.expiry) {
      if (!vals.expiry) errs.expiry = 'Expiry is required'
      else if (!/^\d{2}\/\d{2}$/.test(vals.expiry)) errs.expiry = 'Use MM/YY format'
      else if (!validateExpiry(vals.expiry)) errs.expiry = 'Card is expired or invalid'
    }
    if (touched.cvv || vals.cvv) {
      if (!vals.cvv) errs.cvv = 'CVV is required'
      else if (vals.cvv.length < 3 || vals.cvv.length > 4) errs.cvv = 'CVV must be 3 or 4 digits'
    }
    return errs
  }

  useEffect(() => {
    onValidityChange?.(isCreditCardValid({ number, holder, expiry, cvv }))
  }, [number, holder, expiry, cvv, onValidityChange])

  const formatNumber = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 16)
    return d.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 4)
    if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2)
    return d
  }

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validate())
  }

  return (
    <div className="space-y-4 mt-3">
      <div className="space-y-2">
        <Label htmlFor="card-number">
          Card Number <span className="text-error">*</span>
        </Label>
        <Input
          id="card-number"
          placeholder="1234 5678 9012 3456"
          value={number}
          onChange={(e) => {
            setNumber(formatNumber(e.target.value))
            if (touched.number) setErrors(validate({ number: formatNumber(e.target.value), holder, expiry, cvv }))
          }}
          onBlur={() => handleBlur('number')}
          inputMode="numeric"
          maxLength={19}
          aria-invalid={!!errors.number}
          className={errors.number ? 'border-error focus-visible:ring-error' : ''}
        />
        {cardType && !errors.number && <p className="text-xs text-muted-foreground">{cardType}</p>}
        {errors.number && <p className="text-xs text-error" role="alert">{errors.number}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-holder">
          Cardholder Name <span className="text-error">*</span>
        </Label>
        <Input
          id="card-holder"
          placeholder="Full name on card"
          value={holder}
          onChange={(e) => {
            setHolder(e.target.value)
            if (touched.holder) setErrors(validate({ number, holder: e.target.value, expiry, cvv }))
          }}
          onBlur={() => handleBlur('holder')}
          aria-invalid={!!errors.holder}
          className={errors.holder ? 'border-error focus-visible:ring-error' : ''}
        />
        {errors.holder && <p className="text-xs text-error" role="alert">{errors.holder}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="card-expiry">
            Expiry (MM/YY) <span className="text-error">*</span>
          </Label>
          <Input
            id="card-expiry"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => {
              setExpiry(formatExpiry(e.target.value))
              if (touched.expiry) setErrors(validate({ number, holder, expiry: formatExpiry(e.target.value), cvv }))
            }}
            onBlur={() => handleBlur('expiry')}
            maxLength={5}
            inputMode="numeric"
            aria-invalid={!!errors.expiry}
            className={errors.expiry ? 'border-error focus-visible:ring-error' : ''}
          />
          {errors.expiry && <p className="text-xs text-error" role="alert">{errors.expiry}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="card-cvv">
            CVV <span className="text-error">*</span>
          </Label>
          <Input
            id="card-cvv"
            type="password"
            placeholder="123"
            value={cvv}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4)
              setCvv(v)
              if (touched.cvv) setErrors(validate({ number, holder, expiry, cvv: v }))
            }}
            onBlur={() => handleBlur('cvv')}
            maxLength={4}
            inputMode="numeric"
            aria-invalid={!!errors.cvv}
            className={errors.cvv ? 'border-error focus-visible:ring-error' : ''}
          />
          {errors.cvv && <p className="text-xs text-error" role="alert">{errors.cvv}</p>}
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
