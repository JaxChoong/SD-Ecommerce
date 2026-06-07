import { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import type { Customer } from '../../types'

interface ShippingFormProps {
  values: Customer
  onChange: (values: Customer) => void
  errors?: Partial<Record<keyof Customer, string>>
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^01[0-9]-?[0-9]{7,8}$/

// eslint-disable-next-line react-refresh/only-export-components
export function validateCustomerField(key: keyof Customer, value: string): string | undefined {
  const v = value.trim()
  switch (key) {
    case 'name':
      if (!v) return 'Full name is required'
      if (v.length < 2) return 'Name is too short'
      return undefined
    case 'email':
      if (!v) return 'Email is required'
      if (!EMAIL_RE.test(v)) return 'Enter a valid email address'
      return undefined
    case 'phone':
      if (!v) return 'Phone number is required'
      if (!PHONE_RE.test(v)) return 'Use Malaysian format, e.g. 012-3456789'
      return undefined
    case 'shoppingAddress':
      if (!v) return 'Shipping address is required'
      if (v.length < 10) return 'Please provide a more complete address'
      return undefined
    default:
      return undefined
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function isCustomerValid(values: Customer): boolean {
  return (['name', 'email', 'phone', 'shoppingAddress'] as const).every(
    (k) => !validateCustomerField(k, values[k]),
  )
}

const fields: Array<{ key: keyof Customer; label: string; placeholder?: string; type?: string; multiline?: boolean }> = [
  { key: 'name',           label: 'Full Name',     placeholder: 'As shown on ID', type: 'text' },
  { key: 'email',          label: 'Email',         placeholder: 'you@example.com', type: 'email' },
  { key: 'phone',          label: 'Phone',         placeholder: '012-3456789',   type: 'tel' },
  { key: 'shoppingAddress', label: 'Shipping Address', placeholder: 'Street, postcode city, state', multiline: true },
]

export function ShippingForm({ values, onChange, errors }: ShippingFormProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof Customer, boolean>>>({})

  const handleChange = (key: keyof Customer, value: string) => {
    onChange({ ...values, [key]: value })
  }

  const handleBlur = (key: keyof Customer) => {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  const errorFor = (key: keyof Customer): string | undefined => {
    if (errors && errors[key]) return errors[key]
    if (touched[key]) return validateCustomerField(key, values[key])
    return undefined
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold leading-relaxed">Shipping Address</h3>
      <div className="space-y-4">
        {fields.map(({ key, label, placeholder, type, multiline }) => {
          const err = errorFor(key)
          const sharedProps = {
            id: `shipping-${key}`,
            placeholder,
            value: values[key],
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(key, e.target.value),
            onBlur: () => handleBlur(key),
            'aria-invalid': !!err,
            className: err ? 'border-error focus-visible:ring-error' : '',
          }
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={`shipping-${key}`}>
                {label} <span className="text-error">*</span>
              </Label>
              {multiline ? (
                <Textarea {...sharedProps} rows={3} />
              ) : (
                <Input {...sharedProps} type={type || 'text'} />
              )}
              {err && <p className="text-xs text-error" role="alert">{err}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
