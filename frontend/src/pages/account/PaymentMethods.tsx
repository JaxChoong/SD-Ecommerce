import { Container } from '../../components/layout/container'
import { CreditCard } from 'lucide-react'

const mockCards = [
  { id: 'card1', last4: '4242', brand: 'Visa', expiry: '12/27', isDefault: true },
  { id: 'card2', last4: '8888', brand: 'Mastercard', expiry: '08/26', isDefault: false },
]

export default function PaymentMethods() {
  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold mb-6">Payment Methods</h1>
      {mockCards.length === 0 ? (
        <p className="text-muted-foreground">No saved payment methods.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mockCards.map((card) => (
            <div key={card.id} className="bg-surface rounded-radius p-4 relative">
              {card.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-full">Default</span>
              )}
              <CreditCard className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="font-medium text-sm">{card.brand} •••• {card.last4}</p>
              <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
