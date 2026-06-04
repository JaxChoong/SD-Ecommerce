import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'

export default function AdminCouponForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '', minPurchase: '', maxDiscount: '', expiresAt: '', usageLimit: '', isActive: true,
  })

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/coupons`)
      .then((r) => r.json())
      .then((coupons) => {
        const c = coupons.find((c: { id: string }) => c.id === id)
        if (c) {
          setForm({
            code: c.code, description: c.description, discountType: c.discountType,
            discountValue: String(c.discountValue), minPurchase: c.minPurchase ? String(c.minPurchase) : '',
            maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
            expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
            usageLimit: c.usageLimit ? String(c.usageLimit) : '', isActive: c.isActive,
          })
        }
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : new Date(Date.now() + 365 * 86400000).toISOString(),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      isActive: form.isActive,
    }
    try {
      if (isEdit) {
        await fetch(`/api/admin/coupons/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      navigate('/admin/coupons')
    } catch {
      alert('Failed to save coupon.')
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
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={form.code} onChange={(e) => update('code', e.target.value.toUpperCase())} placeholder="SAVE20" required />
          </div>
          <div>
            <Label htmlFor="expiresAt">Expiry Date</Label>
            <Input id="expiresAt" type="date" value={form.expiresAt} onChange={(e) => update('expiresAt', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Save 20% on your order" required />
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
          <div>
            <Label htmlFor="minPurchase">Min Purchase (RM)</Label>
            <Input id="minPurchase" type="number" step="0.01" value={form.minPurchase} onChange={(e) => update('minPurchase', e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="maxDiscount">Max Discount (RM)</Label>
            <Input id="maxDiscount" type="number" step="0.01" value={form.maxDiscount} onChange={(e) => update('maxDiscount', e.target.value)} placeholder="For percentage only" />
          </div>
          <div>
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input id="usageLimit" type="number" value={form.usageLimit} onChange={(e) => update('usageLimit', e.target.value)} placeholder="Unlimited if empty" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="isActive" checked={form.isActive} onCheckedChange={(c) => update('isActive', c === true)} />
            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
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
