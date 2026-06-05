import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useAuth } from '../../context/AuthContext'

const categories = ['Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories', 'Dresses']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { adminToken } = useAuth()
  const isEdit = !!id
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Shirts',
    size: 'M',
    basePrice: '',
    stockQuantity: '',
  })

  useEffect(() => {
    if (!id || !adminToken) return
    fetch(`/api/admin/inventory/${id}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load product')
        return r.json()
      })
      .then((p) => {
        setForm({
          name: p.name || '',
          description: p.description || '',
          category: p.category || 'Shirts',
          size: p.size || 'M',
          basePrice: String(p.basePrice || ''),
          stockQuantity: String(p.stockQuantity || ''),
        })
        if (p.image) {
          setPreviewUrl(p.image)
        }
      })
      .catch((err) => {
        console.error(err)
        alert('Error loading product information.')
      })
  }, [id, adminToken])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
        alert('Only PNG, JPG, and JPEG images are accepted.')
        e.target.value = ''
        setImageFile(null)
        return
      }
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Construct FormData instead of JSON to support file uploads
    const formData = new FormData()
    formData.append('product[name]', form.name)
    formData.append('product[category]', form.category)
    formData.append('product[size]', form.size)
    formData.append('product[basePrice]', form.basePrice)
    formData.append('product[stockQuantity]', form.stockQuantity)
    formData.append('product[description]', form.description)
    
    if (imageFile) {
      formData.append('product[image]', imageFile)
    }

    try {
      const url = isEdit ? `/api/admin/inventory/${id}` : '/api/admin/inventory'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          // Note: Browser automatically sets the Content-Type with boundary for FormData
        },
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMsg = errorData.errors ? errorData.errors.join(', ') : 'Unknown error'
        throw new Error(errorMsg)
      }

      navigate('/admin/products')
    } catch (err: any) {
      alert(`Failed to save product: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <Container className="py-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Clothing Item Name</Label>
            <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="E.g., Slim Fit Oxford Shirt" required />
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
          <div>
            <Label htmlFor="size">Size</Label>
            <Select value={form.size} onValueChange={(v) => update('size', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Detailed product specifications, materials, fit..." />
          </div>
          <div>
            <Label htmlFor="basePrice">Base Price (RM)</Label>
            <Input id="basePrice" type="number" step="0.01" value={form.basePrice} onChange={(e) => update('basePrice', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <Input id="stockQuantity" type="number" value={form.stockQuantity} onChange={(e) => update('stockQuantity', e.target.value)} required />
          </div>
          
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="imageFile">Product Image ({isEdit ? 'Optional to change' : 'Required'})</Label>
            <Input 
              id="imageFile" 
              type="file" 
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handleFileChange} 
              required={!isEdit} 
            />
            {previewUrl && (
              <div className="mt-2 shrink-0">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <div className="h-32 w-32 rounded-radius bg-surface overflow-hidden border border-border">
                  <img src={previewUrl} className="h-full w-full object-cover" alt="Product preview" />
                </div>
              </div>
            )}
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
