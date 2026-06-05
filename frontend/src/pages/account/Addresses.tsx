import { useState, useEffect } from 'react'
import { Container } from '../../components/layout/container'
import { MapPin } from 'lucide-react'

interface Address {
  id: string
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  postcode: string
  isDefault: boolean
}

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/addresses')
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data || [])
      })
      .catch((err) => console.error('Error fetching addresses:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold mb-6">Saved Addresses</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <p className="text-muted-foreground">No saved addresses.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-surface rounded-radius p-4 relative border border-border/20 shadow-sm">
              {addr.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-full font-medium">Default</span>
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
