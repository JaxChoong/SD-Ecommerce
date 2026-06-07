import type { PaymentMethod, PaymentMethodType, EwalletProvider, OnlineBank } from '../../types'
import { CreditCardForm } from './credit-card-form'

interface PaymentSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  onCreditCardValidityChange?: (isValid: boolean) => void
}

const ewalletProviders: Array<{ id: EwalletProvider; label: string }> = [
  { id: 'tng',       label: 'Touch \'n Go eWallet' },
  { id: 'grabpay',   label: 'GrabPay' },
  { id: 'boost',     label: 'Boost' },
  { id: 'shopeepay', label: 'ShopeePay' },
]

const onlineBanks: Array<{ id: OnlineBank; label: string }> = [
  { id: 'maybank',     label: 'Maybank2u' },
  { id: 'cimb',        label: 'CIMB Clicks' },
  { id: 'public_bank', label: 'Public Bank' },
  { id: 'rhb',         label: 'RHB Now' },
  { id: 'hong_leong',  label: 'Hong Leong Connect' },
  { id: 'ambank',      label: 'AmBank' },
  { id: 'bank_rakyat', label: 'Bank Rakyat' },
  { id: 'bsn',         label: 'BSN MyRinggit' },
]

const methods: Array<{
  type: PaymentMethodType
  title: string
  description: string
}> = [
  { type: 'ewallet',        title: 'E-Wallet',        description: 'Pay with your preferred mobile wallet' },
  { type: 'credit_card',    title: 'Credit Card',     description: 'Visa, Mastercard, or American Express' },
  { type: 'online_banking', title: 'Online Banking',  description: 'FPX — log in to your bank to authorize' },
]

export function PaymentSelector({ value, onChange, onCreditCardValidityChange }: PaymentSelectorProps) {
  return (
    <div className="space-y-3">
      {methods.map((m) => {
        const isSelected = value.type === m.type
        return (
          <div
            key={m.type}
            onClick={() => {
              if (isSelected) return
              if (m.type === 'ewallet')        onChange({ type: 'ewallet', provider: 'tng' })
              else if (m.type === 'online_banking') onChange({ type: 'online_banking', bank: 'maybank' })
              else                                  onChange({ type: 'credit_card' })
            }}
            className={`relative rounded-radius border p-4 cursor-pointer transition-colors ${
              isSelected ? 'border-foreground' : 'border-border'
            }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-foreground" />
            )}
            <h4 className="text-sm font-semibold leading-relaxed">{m.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>

            {isSelected && m.type === 'ewallet' && (
              <div
                className="mt-3 grid grid-cols-2 gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {ewalletProviders.map((p) => {
                  const active = value.type === 'ewallet' && value.provider === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onChange({ type: 'ewallet', provider: p.id })}
                      className={`relative rounded-radius border p-2.5 text-sm leading-relaxed text-left ${
                        active ? 'border-foreground' : 'border-border'
                      }`}
                    >
                      {active && (
                        <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-foreground" />
                      )}
                      {p.label}
                    </button>
                  )
                })}
              </div>
            )}

            {isSelected && m.type === 'online_banking' && (
              <div
                className="mt-3 grid grid-cols-2 gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {onlineBanks.map((b) => {
                  const active = value.type === 'online_banking' && value.bank === b.id
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onChange({ type: 'online_banking', bank: b.id })}
                      className={`relative rounded-radius border p-2.5 text-sm leading-relaxed text-left ${
                        active ? 'border-foreground' : 'border-border'
                      }`}
                    >
                      {active && (
                        <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-foreground" />
                      )}
                      {b.label}
                    </button>
                  )
                })}
              </div>
            )}

            {isSelected && m.type === 'credit_card' && (
              <div onClick={(e) => e.stopPropagation()} className="mt-3">
                <CreditCardForm onValidityChange={onCreditCardValidityChange} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
