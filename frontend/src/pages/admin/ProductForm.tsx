import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const categories = ['Lighting', 'Home', 'Electronics', 'Stationery', 'Accessories', 'Kitchen']

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', originalPrice: '',
    category: 'Home', image: '', stock: '', isNew: false,
  })

  useEffect(() => {
    if (!id) return
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setForm({
          name: p.name, slug: p.slug, description: p.description,
          price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '',
          category: p.category, image: p.image, stock: String(p.stock), isNew: p.isNew || false,
        })
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category,
      image: form.image || '/placeholder.svg',
      stock: Number(form.stock),
      isNew: form.isNew,
    }
    try {
      if (isEdit) {
        await fetch(`/api/admin/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      navigate('/admin/products')
    } catch {
      alert('Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <Container className="py-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="Auto-generated if empty" />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={form.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="price">Price (RM)</Label>
            <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="originalPrice">Original Price (RM)</Label>
            <Input id="originalPrice" type="number" step="0.01" value={form.originalPrice} onChange={(e) => update('originalPrice', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="/placeholder.svg" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="isNew" checked={form.isNew} onCheckedChange={(c) => update('isNew', c === true)} />
            <Label htmlFor="isNew" className="cursor-pointer">Mark as New</Label>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
        </div>
      </form>
    </Container>
  )
}
