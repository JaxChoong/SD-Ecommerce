import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useAuth } from '../../context/AuthContext'
import type { Coupon } from '../../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const categories = ['Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories', 'Dresses']

// Extend the Coupon type locally to include category for display
interface ExtendedCoupon extends Coupon {
  category: string
}

interface DbPromotion {
  promotionid: number | string
  promoCode: string
  name?: string
  type: string
  discountValue: number | string
  category?: string
  endDate: string
  IsActive: boolean | number
  usageLimit?: number | null
  usageCount?: number
  discountTarget?: string
}

export default function AdminCoupons() {
  const { adminToken } = useAuth()
  const [coupons, setCoupons] = useState<ExtendedCoupon[]>(() => {
    const stored = sessionStorage.getItem('ezshop_admin_coupons')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse cached coupons', e)
      }
    }
    return []
  })
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(() => {
    const stored = sessionStorage.getItem('ezshop_admin_coupons')
    return !stored
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [prevFilters, setPrevFilters] = useState({ search: '', selectedCategory: '' })

  if (
    prevFilters.search !== search ||
    prevFilters.selectedCategory !== selectedCategory
  ) {
    setPrevFilters({ search, selectedCategory })
    setCurrentPage(1)
  }

  const fetchCoupons = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)

    const queryString = params.toString() ? `?${params.toString()}` : ''

    fetch(`/api/admin/promotions${queryString}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load promotions')
        return r.json()
      })
      .then((data) => {
        const mapped: ExtendedCoupon[] = (data || []).map((c: DbPromotion) => ({
          id: String(c.promotionid),
          code: c.promoCode,
          description: c.name || '',
          discountType: c.type as 'percentage' | 'fixed',
          discountValue: Number(c.discountValue),
          category: c.category || 'all',
          expiresAt: c.endDate,
          isActive: Boolean(c.IsActive),
          usageCount: Number(c.usageCount || 0),
          usageLimit: c.usageLimit != null ? Number(c.usageLimit) : undefined,
          discountTarget: (c.discountTarget || 'base_price') as 'base_price' | 'shipping',
        }))
        setCoupons(mapped)
        try {
          sessionStorage.setItem('ezshop_admin_coupons', JSON.stringify(mapped));
        } catch (e) {
          console.error('Failed to save coupons to sessionStorage', e);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (coupons.length > 0) {
        return;
      }
    }
    fetchCoupons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, adminToken])

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete coupon'
      alert(msg)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('all')
  }

  const hasActiveFilters = search !== '' || selectedCategory !== 'all'

  const itemsPerPage = 10
  const totalPages = Math.ceil(coupons.length / itemsPerPage)
  const paginatedCoupons = coupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/coupons/new"><Plus className="h-4 w-4 mr-1" /> New Coupon</Link>
        </Button>
      </div>

      {/* Search and Filters bar */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6 bg-surface p-4 rounded-radius border border-border/20">
        <div>
          <Input
            placeholder="Search code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-end">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground w-full sm:w-auto">
              Reset Filters
            </Button>
          )}
        </div>
      </div>

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
                  <th className="pb-3 font-medium">Discount Target</th>
                  <th className="pb-3 font-medium">Discount</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Redemptions</th>
                  <th className="pb-3 font-medium">Expires At</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCoupons.map((c) => (
                  <tr key={c.id} className="border-b border-border">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-sm font-medium">{c.code}</span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground capitalize">
                      {c.discountTarget === 'shipping' ? 'Shipping Fee' : c.category === 'all' ? 'Global (All)' : c.category}
                    </td>
                    <td className="py-3 pr-4">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `RM${c.discountValue}`}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.description}</td>
                    <td className="py-3 pr-4 text-muted-foreground font-mono">
                      {c.usageCount} / {c.usageLimit != null ? c.usageLimit : '∞'}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 pr-4">
                      {(() => {
                        const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false
                        if (isExpired) {
                          return (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                              Expired
                            </span>
                          )
                        }
                        return (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/coupons/${c.id}/edit`} state={{ coupon: c }}><Pencil className="h-4 w-4" /></Link>
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
            {paginatedCoupons.map((c) => (
              <div key={c.id} className="bg-surface rounded-radius p-4 border border-border/20 shadow-sm flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-3 border-b border-border/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">{c.code}</span>
                      {(() => {
                        const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false
                        if (isExpired) {
                          return (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-warning/10 text-warning">
                              Expired
                            </span>
                          )
                        }
                        return (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )
                      })()}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link to={`/admin/coupons/${c.id}/edit`} state={{ coupon: c }}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4 text-error" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between py-0.5 border-b border-border/5">
                      <span>Discount</span>
                      <span className="font-semibold text-foreground">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `RM${c.discountValue}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-border/5">
                      <span>Discount Target</span>
                      <span className="capitalize text-foreground font-medium">
                        {c.discountTarget === 'shipping' ? 'Shipping Fee' : c.category === 'all' ? 'Global (All)' : c.category}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-border/5">
                      <span>Redemptions</span>
                      <span className="font-mono text-foreground font-medium">
                        {c.usageCount} / {c.usageLimit != null ? c.usageLimit : '∞'}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>Expires At</span>
                      <span className="text-foreground">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className="border-t border-border/10 pt-2.5 mt-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block mb-1 font-medium">Campaign Description</span>
                      <p className="text-foreground/90 text-xs leading-relaxed">{c.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/30 pt-4 mt-6">
              <span className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {Math.min(coupons.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
                {Math.min(coupons.length, currentPage * itemsPerPage)} of{' '}
                {coupons.length} coupons
              </span>
              <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  )
}
