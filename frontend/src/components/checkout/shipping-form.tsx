import { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { Address } from '../../types'

interface ShippingFormProps {
  values: Address
  onChange: (values: Address) => void
  errors?: Partial<Record<keyof Address, string>>
  showErrors?: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^01[0-9]-?[0-9]{7,8}$/
const POSTCODE_RE = /^[0-9]{5}$/

// eslint-disable-next-line react-refresh/only-export-components
export function validateShippingField(key: keyof Address, value: string): string | undefined {
  const v = (value || '').trim()
  switch (key) {
    case 'fullName':
      if (!v) return 'Full name is required'
      if (v.length < 2) return 'Full name is too short'
      return undefined
    case 'phone':
      if (!v) return 'Phone number is required'
      if (!PHONE_RE.test(v)) return 'Use a valid Malaysian number (e.g. 012-3456789)'
      return undefined
    case 'email':
      if (!v) return 'Email is required'
      if (!EMAIL_RE.test(v)) return 'Use a valid email address'
      return undefined
    case 'address':
      if (!v) return 'Street address is required'
      if (v.length < 5) return 'Please provide a more complete address'
      return undefined
    case 'city':
      if (!v) return 'City is required'
      return undefined
    case 'state':
      if (!v) return 'State is required'
      return undefined
    case 'postcode':
      if (!v) return 'Postcode is required'
      if (!POSTCODE_RE.test(v)) return 'Use a valid 5-digit postcode'
      return undefined
    default:
      return undefined
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function isShippingValid(values: Address): boolean {
  return (
    !validateShippingField('fullName', values.fullName) &&
    !validateShippingField('phone', values.phone) &&
    !validateShippingField('email', values.email) &&
    !validateShippingField('address', values.address) &&
    !validateShippingField('city', values.city) &&
    !validateShippingField('state', values.state) &&
    !validateShippingField('postcode', values.postcode)
  )
}

const fields: Array<{ key: keyof Address; label: string; placeholder?: string; type?: string }> = [
  { key: 'fullName', label: 'Full Name',    placeholder: 'Your full name',          type: 'text' },
  { key: 'phone',    label: 'Phone Number', placeholder: '012-3456789',             type: 'tel' },
  { key: 'email',    label: 'Email',        placeholder: 'your@email.com',          type: 'email' },
  { key: 'address',  label: 'Address',      placeholder: 'Street address',          type: 'text' },
  { key: 'city',     label: 'City',         placeholder: 'Your city',               type: 'text' },
  { key: 'state',    label: 'State',        placeholder: 'Your state',              type: 'text' },
  { key: 'postcode', label: 'Postcode',     placeholder: '5-digit postcode',        type: 'text' },
]

export function ShippingForm({ values, onChange, errors, showErrors }: ShippingFormProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof Address, boolean>>>({})

  const handleChange = (key: keyof Address, value: string) => {
    onChange({ ...values, [key]: value })
  }

  const handleBlur = (key: keyof Address) => {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  const errorFor = (key: keyof Address): string | undefined => {
    if (errors && errors[key]) return errors[key]
    if (showErrors || touched[key]) {
      return validateShippingField(key, String(values[key] || ''))
    }
    return undefined
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold leading-relaxed">Shipping Address</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, placeholder, type }) => {
          const err = errorFor(key)
          return (
            <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
              <Label htmlFor={key}>
                {label} <span className="text-error">*</span>
              </Label>
              <Input
                id={key}
                type={type || 'text'}
                placeholder={placeholder}
                value={(values[key as keyof Address] as string) || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                onBlur={() => handleBlur(key)}
                aria-invalid={!!err}
                aria-describedby={err ? `${key}-error` : undefined}
                className={`mt-1 ${err ? 'border-error focus-visible:ring-error' : ''}`}
              />
              {err && (
                <p id={`${key}-error`} className="text-xs text-error mt-1" role="alert">
                  {err}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
