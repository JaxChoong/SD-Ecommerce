import type { PaymentMethod } from '../../types'
import { EwalletOptions } from './ewallet-options'
import { DuitnowQr } from './duitnow-qr'
import { CreditCardForm } from './credit-card-form'

interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {

  const sections: Array<{
    id: string
    title: string
    description: string
    content: (selected: boolean) => React.ReactNode
  }> = [
    {
      id: 'ewallet',
      title: 'E-Wallets',
      description: 'Pay with your preferred e-wallet',
      content: (selected) => (
        <EwalletOptions
          selected={selected ? (value as { type: 'ewallet'; provider: string }).provider : undefined}
          onSelect={(provider) => onChange({ type: 'ewallet', provider } as PaymentMethod)}
        />
      ),
    },
    {
      id: 'duitnow',
      title: 'DuitNow',
      description: 'Pay via DuitNow QR or Online Banking',
      content: (selected) => (
        selected ? <DuitnowQr /> : null
      ),
    },
    {
      id: 'card',
      title: 'Credit / Debit Card',
      description: 'Pay with Visa or Mastercard',
      content: (selected) => (
        selected ? (
          <CreditCardForm />
        ) : null
      ),
    },
  ]

  const selectedId = value.type

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isSelected = selectedId === section.id
        return (
          <div
            key={section.id}
            onClick={() => {
              if (section.id === 'ewallet' && !isSelected) {
                onChange({ type: 'ewallet', provider: 'tng' })
              } else if (section.id === 'duitnow' && !isSelected) {
                onChange({ type: 'duitnow', subtype: 'qr' })
              } else if (section.id === 'card' && !isSelected) {
                onChange({ type: 'card' })
              }
            }}
            className={`relative rounded-radius border p-4 cursor-pointer transition-colors ${
              isSelected ? 'border-foreground' : 'border-border'
            }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-foreground" />
            )}
            <h4 className="text-sm font-semibold leading-relaxed">{section.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
            {section.content(isSelected)}
          </div>
        )
      })}
    </div>
  )
}
