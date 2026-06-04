import { useState } from 'react'
import { Search, Tags } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { CouponCard } from './coupon-card'
import { useCoupons } from '../../hooks/useCoupons'

export function CouponSearchDialog() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const { coupons, isLoading } = useCoupons()

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Tags className="h-4 w-4" />
          Browse Coupons
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Available Coupons</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-80 overflow-auto space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No coupons found</p>
          ) : (
            filtered.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onApply={() => setOpen(false)}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
