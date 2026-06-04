interface EwalletOptionsProps {
  selected?: string
  onSelect: (provider: string) => void
}

const providers = [
  { id: 'tng', label: 'Touch \'n Go' },
  { id: 'grabpay', label: 'GrabPay' },
  { id: 'boost', label: 'Boost' },
  { id: 'shopeepay', label: 'ShopeePay' },
]

export function EwalletOptions({ selected, onSelect }: EwalletOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(p.id) }}
          className={`relative rounded-radius border p-3 text-sm transition-colors leading-relaxed ${
            selected === p.id ? 'border-foreground' : 'border-border'
          }`}
        >
          {selected === p.id && (
            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-foreground" />
          )}
          {p.label}
        </button>
      ))}
    </div>
  )
}
