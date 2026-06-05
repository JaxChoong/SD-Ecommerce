import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'
import { useAuth } from '../../context/AuthContext'

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
    expiresAt: '',
    isActive: true,
  })

  useEffect(() => {
    if (!id || !adminToken) return
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
        setForm({
          code: c.promoCode || '',
          description: c.name || '',
          discountType: (c.type || 'percentage') as 'percentage' | 'fixed',
          discountValue: String(c.discountValue || ''),
          expiresAt: c.endDate ? c.endDate.split('T')[0] : '',
          isActive: c.IsActive !== false,
        })
      })
      .catch((err) => {
        console.error(err)
        alert('Error loading coupon information.')
      })
  }, [id, adminToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Calculate start/end dates
    const start = new Date().toISOString()
    const end = form.expiresAt 
      ? new Date(form.expiresAt).toISOString() 
      : new Date(Date.now() + 365 * 86400000).toISOString()

    // Wrap promotion parameters under the 'promotion' namespace for Rails strong params
    const body = {
      promotion: {
        promoCode: form.code,
        name: form.description,
        type: form.discountType,
        discountValue: Number(form.discountValue),
        startDate: start,
        endDate: end,
        IsActive: form.isActive,
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
    } catch (err: any) {
      alert(`Failed to save coupon: ${err.message}`)
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
            <Input id="expiresAt" type="date" value={form.expiresAt} onChange={(e) => update('expiresAt', e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Campaign Description / Name</Label>
            <Input id="description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="E.g., 20% Off Storewide" required />
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
            <Input id="discountValue" type="number" step="0.01" value={form.discountValue} onChange={(e) => update('discountValue', e.target.value)} required />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox id="isActive" checked={form.isActive} onCheckedChange={(c) => update('isActive', c === true)} />
            <Label htmlFor="isActive" className="cursor-pointer">Active Campaign</Label>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (isEdit ? 'Update Coupon' : 'Create Coupon')}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/coupons')}>Cancel</Button>
        </div>
      </form>
    </Container>
  )
}
