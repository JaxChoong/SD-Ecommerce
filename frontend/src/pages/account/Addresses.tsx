import { Container } from '../../components/layout/container'
import { MapPin } from 'lucide-react'

const mockAddresses = [
  { id: 'a1', fullName: 'Alex Tan', phone: '012-3456789', address: '12, Jalan Bukit Bintang', city: 'Kuala Lumpur', state: 'WP Kuala Lumpur', postcode: '55100', isDefault: true },
  { id: 'a2', fullName: 'Alex Tan', phone: '016-9876543', address: '45, Persiaran Gurney', city: 'George Town', state: 'Pulau Pinang', postcode: '10250', isDefault: false },
]

export default function Addresses() {
  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold mb-6">Saved Addresses</h1>
      {mockAddresses.length === 0 ? (
        <p className="text-muted-foreground">No saved addresses.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mockAddresses.map((addr) => (
            <div key={addr.id} className="bg-surface rounded-radius p-4 relative">
              {addr.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-full">Default</span>
              )}
              <MapPin className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="font-medium text-sm">{addr.fullName}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {addr.address}<br />{addr.city}, {addr.state} {addr.postcode}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
