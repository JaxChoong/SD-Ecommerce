import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../context/AuthContext'
import type { Coupon } from '../../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function AdminCoupons() {
  const { adminToken } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCoupons = () => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    fetch(`/api/admin/promotions${params}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load promotions')
        return r.json()
      })
      .then((data) => {
        const mapped: Coupon[] = (data || []).map((c: any) => ({
          id: String(c.promotionid),
          code: c.promoCode,
          description: c.name || '',
          discountType: c.type as 'percentage' | 'fixed',
          discountValue: Number(c.discountValue),
          expiresAt: c.endDate,
          isActive: Boolean(c.IsActive),
          usageCount: 0, // Mocked as it is not part of the Page 30 database schema
          usageLimit: undefined, // Mocked as it is not part of the Page 30 database schema
        }))
        setCoupons(mapped)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCoupons()
  }, [search, adminToken])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })
      if (!res.ok) throw new Error('Delete failed')
      fetchCoupons()
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon')
    }
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
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Expires At</th>
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
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.description}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
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
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `RM${c.discountValue}`} • {c.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
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
