import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import type { Coupon } from '../../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCoupons = () => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    fetch(`/api/admin/coupons${params}`)
      .then((r) => r.json())
      .then((data) => setCoupons(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCoupons() }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    fetchCoupons()
  }

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/coupons/new"><Plus className="h-4 w-4 mr-1" /> New Coupon</Link>
        </Button>
      </div>
      <Input
        placeholder="Search coupons..."
        className="max-w-xs mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : coupons.length === 0 ? (
        <p className="text-muted-foreground">No coupons found.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium">Discount</th>
                  <th className="pb-3 font-medium">Min Purchase</th>
                  <th className="pb-3 font-medium">Usage</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-border">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-sm font-medium">{c.code}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `RM${c.discountValue}`}
                      {c.maxDiscount ? ` (max RM${c.maxDiscount})` : ''}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {c.minPurchase ? `RM${c.minPurchase}` : 'None'}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {c.usageCount}/{c.usageLimit || '∞'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/coupons/${c.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4 text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="bg-surface rounded-radius p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium">{c.code}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${c.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `RM${c.discountValue}`}
                    {c.maxDiscount ? ` (max RM${c.maxDiscount})` : ''}
                    {c.minPurchase ? ` • Min RM${c.minPurchase}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Used: {c.usageCount}/{c.usageLimit || '∞'}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                    <Link to={`/admin/coupons/${c.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4 text-error" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Container>
  )
}
