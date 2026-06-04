import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { Address } from '../../types'

interface ShippingFormProps {
  values: Address
  onChange: (values: Address) => void
}

export function ShippingForm({ values, onChange }: ShippingFormProps) {
  const fields: Array<{ key: keyof Address; label: string; placeholder?: string; type?: string }> = [
    { key: 'fullName', label: 'Full Name', placeholder: 'Your full name' },
    { key: 'phone', label: 'Phone Number', placeholder: '012-3456789', type: 'tel' },
    { key: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
    { key: 'address', label: 'Address', placeholder: 'Street address' },
    { key: 'city', label: 'City', placeholder: 'Your city' },
    { key: 'state', label: 'State', placeholder: 'Your state' },
    { key: 'postcode', label: 'Postcode', placeholder: 'Postcode' },
  ]

  const handleChange = (key: keyof Address, value: string) => {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold leading-relaxed">Shipping Address</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type={type || 'text'}
              placeholder={placeholder}
              value={(values[key as keyof Address] as string) || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
