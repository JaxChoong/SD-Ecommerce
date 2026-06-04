import { useState } from 'react'
import { Container } from '../components/layout/container'
import { CouponCard } from '../components/coupon/coupon-card'
import { CouponSearchDialog } from '../components/coupon/coupon-search-dialog'
import { Input } from '../components/ui/input'
import { Search } from 'lucide-react'
import { useCoupons } from '../hooks/useCoupons'

export default function Coupons() {
  const [search, setSearch] = useState('')
  const { coupons, isLoading } = useCoupons()

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Container className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Available Coupons</h1>
          <p className="text-sm text-muted-foreground">Find and apply discount codes to save on your purchase.</p>
        </div>
        <CouponSearchDialog />
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search coupons..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading coupons...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No coupons found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}
    </Container>
  )
}
