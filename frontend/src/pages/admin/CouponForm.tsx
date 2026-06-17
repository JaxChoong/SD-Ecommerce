import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useAuth } from '../../context/AuthContext'

const categories = ['Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories', 'Dresses']

export default function AdminCouponForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { adminToken } = useAuth()
  const isEdit = !!id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    category: 'all',
    expiresAt: new Date(Date.now() + 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    isActive: true,
    hasQuantityLimit: false,
    usageLimit: '',
    discountTarget: 'base_price' as 'base_price' | 'shipping',
  })

  const location = useLocation()

  const populateCoupon = (c: any) => {
    const rawCategory = c.category || 'all'
    const normalizedCategory = rawCategory.toLowerCase() === 'all'
      ? 'all'
      : (categories.find((cat) => cat.toLowerCase() === rawCategory.toLowerCase()) || 'all')

    setForm({
      code: c.code || c.promoCode || '',
      description: c.description || c.name || '',
      discountType: (c.discountType || c.type || 'percentage') as 'percentage' | 'fixed',
      discountValue: String(c.discountValue || ''),
      category: normalizedCategory,
      expiresAt: (c.expiresAt || c.endDate) ? (c.expiresAt || c.endDate).split('T')[0] : '',
      isActive: c.isActive !== false && c.IsActive !== false,
      hasQuantityLimit: c.usageLimit != null,
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
      discountTarget: (c.discountTarget || 'base_price') as 'base_price' | 'shipping',
    })
  }

  useEffect(() => {
    if (!id) return

    // 1. Try to load from route state
    const stateCoupon = location.state?.coupon
    if (stateCoupon && String(stateCoupon.id) === String(id)) {
      populateCoupon(stateCoupon)
      return
    }

    // 2. Try to load from sessionStorage
    const stored = sessionStorage.getItem('ezshop_admin_coupons')
    if (stored) {
      try {
        const list = JSON.parse(stored)
        const found = list.find((c: any) => String(c.id) === String(id))
        if (found) {
          populateCoupon(found)
          return
        }
      } catch (e) {
        console.error('Error parsing stored coupons', e)
      }
    }

    // 3. Fallback to fetching (hits breakpoints on backend if in development)
    if (!adminToken) return
    fetch(`/api/admin/promotions/${id}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load promotion')
        return r.json()
      })
      .then((c) => {
        populateCoupon(c)
      })
      .catch((err) => {
        console.error(err)
        alert('Error loading coupon information.')
      })
  }, [id, adminToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const start = new Date().toISOString()
    const end = form.expiresAt 
      ? new Date(form.expiresAt).toISOString() 
      : new Date(Date.now() + 365 * 86400000).toISOString()

    const body = {
      promotion: {
        promoCode: form.code,
        name: form.description,
        type: form.discountType,
        discountValue: Number(form.discountValue),
        category: form.discountTarget === 'shipping' ? 'all' : form.category,
        startDate: start,
        endDate: end,
        IsActive: form.isActive,
        usageLimit: form.hasQuantityLimit && form.usageLimit ? Number(form.usageLimit) : null,
        discountTarget: form.discountTarget,
      }
    }

    try {
      const url = isEdit ? `/api/admin/promotions/${id}` : '/api/admin/promotions'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMsg = errorData.errors ? errorData.errors.join(', ') : 'Unknown error'
        throw new Error(errorMsg)
      }

      navigate('/admin/coupons')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Failed to save coupon: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <Container className="py-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{isEdit ? 'Edit Coupon' : 'New Coupon'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="code">Promo Code</Label>
            <Input id="code" value={form.code} onChange={(e) => update('code', e.target.value.toUpperCase())} placeholder="E.g., SAVE20" required />
          </div>
          <div>
            <Label htmlFor="expiresAt">Expiry Date</Label>
            <Input 
              id="expiresAt" 
              type="date" 
              min={new Date(Date.now() + 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
              value={form.expiresAt} 
              onChange={(e) => update('expiresAt', e.target.value)} 
              required 
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Campaign Description / Name</Label>
            <Input id="description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="E.g., 20% Off Storewide" required />
          </div>
          <div>
            <Label htmlFor="category">Applicable Clothing Category</Label>
            <Select value={form.discountTarget === 'shipping' ? 'all' : form.category} onValueChange={(v) => update('category', v)} disabled={form.discountTarget === 'shipping'}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories (Global)</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discountTarget">Discount Target</Label>
            <Select value={form.discountTarget} onValueChange={(v) => update('discountTarget', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="base_price">Products (Base Price)</SelectItem>
                <SelectItem value="shipping">Shipping Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Discount Type</Label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="discountType" value="percentage" checked={form.discountType === 'percentage'} onChange={() => update('discountType', 'percentage')} className="accent-primary" />
                Percentage
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="discountType" value="fixed" checked={form.discountType === 'fixed'} onChange={() => update('discountType', 'fixed')} className="accent-primary" />
                Fixed Amount
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="discountValue">{form.discountType === 'percentage' ? 'Discount (%)' : 'Discount (RM)'}</Label>
            <Input id="discountValue" type="number" step="0.01" max={form.discountType === 'percentage' ? "100" : "99999999.99"} value={form.discountValue} onChange={(e) => {
              let val = e.target.value;
              const maxVal = form.discountType === 'percentage' ? 100 : 99999999.99;
              if (Number(val) > maxVal) val = String(maxVal);
              update('discountValue', val);
            }} required />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox id="isActive" checked={form.isActive} onCheckedChange={(c) => update('isActive', c === true)} />
            <Label htmlFor="isActive" className="cursor-pointer">Active Campaign</Label>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox id="hasQuantityLimit" checked={form.hasQuantityLimit} onCheckedChange={(c) => update('hasQuantityLimit', c === true)} />
            <Label htmlFor="hasQuantityLimit" className="cursor-pointer">Limit coupon redemption count</Label>
          </div>

          {form.hasQuantityLimit && (
            <div className="sm:col-span-2">
              <Label htmlFor="usageLimit">Maximum Quantity Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                placeholder="E.g., 100"
                value={form.usageLimit}
                onChange={(e) => update('usageLimit', e.target.value.replace(/^0+/, '') || '0')}
                required
              />
            </div>
          )}
        </div>
        <div className="flex justify-center sm:justify-start gap-3 pt-4">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (isEdit ? 'Update Coupon' : 'Create Coupon')}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/coupons')}>Cancel</Button>
        </div>
      </form>
    </Container>
  )
}
