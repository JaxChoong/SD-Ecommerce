import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { useAuth } from '../../context/AuthContext'
import { ChevronDown } from 'lucide-react'

const categories = ['Shirts', 'Pants', 'Shoes', 'Jackets', 'Accessories', 'Dresses']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
const shoeSizes = ['39', '40', '41', '42', '43', '44', '45']

const cleanNumberString = (val: string): string => {
  if (val.length > 1 && val.startsWith('0')) {
    return val.replace(/^0+/, '') || '0'
  }
  return val
}

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

  // State to track individual shoe sizes stock counts
  const [shoeStocks, setShoeStocks] = useState<Record<string, string>>({
    '39': '0',
    '40': '0',
    '41': '0',
    '42': '0',
    '43': '0',
    '44': '0',
    '45': '0',
  })

  // State to track individual clothing sizes stock counts
  const [clothingStocks, setClothingStocks] = useState<Record<string, string>>({
    'XS': '0',
    'S': '0',
    'M': '0',
    'L': '0',
    'XL': '0',
    'XXL': '0',
    'One Size': '0',
  })

  const location = useLocation()

  const populateProduct = (p: any) => {
    const rawCategory = (p.category || '').toLowerCase().trim()
    const normalizedCategory = categories.find(
      (cat) => cat.toLowerCase() === rawCategory
    ) || 'Shirts'

    setForm({
      name: p.name || '',
      description: p.description || '',
      category: normalizedCategory,
      size: p.size || 'M',
      basePrice: String(p.price != null ? p.price : p.basePrice || ''),
      stockQuantity: String(p.stock != null ? p.stock : p.stockQuantity || ''),
    })
    if (p.image) {
      setPreviewUrl(p.image)
    }

    const sizeVal = p.size
    if (normalizedCategory === 'Shoes' && sizeVal && sizeVal.startsWith('{')) {
      try {
        const parsed = JSON.parse(sizeVal)
        setShoeStocks({
          '39': String(parsed['39'] || '0'),
          '40': String(parsed['40'] || '0'),
          '41': String(parsed['41'] || '0'),
          '42': String(parsed['42'] || '0'),
          '43': String(parsed['43'] || '0'),
          '44': String(parsed['44'] || '0'),
          '45': String(parsed['45'] || '0'),
        })
      } catch (e) {
        console.error('Error parsing shoe size stocks', e)
      }
    } else if (normalizedCategory !== 'Shoes' && sizeVal && sizeVal.startsWith('{')) {
      try {
        const parsed = JSON.parse(sizeVal)
        setClothingStocks({
          'XS': String(parsed['XS'] || '0'),
          'S': String(parsed['S'] || '0'),
          'M': String(parsed['M'] || '0'),
          'L': String(parsed['L'] || '0'),
          'XL': String(parsed['XL'] || '0'),
          'XXL': String(parsed['XXL'] || '0'),
          'One Size': String(parsed['One Size'] || '0'),
        })
      } catch (e) {
        console.error('Error parsing clothing size stocks', e)
      }
    } else if (normalizedCategory !== 'Shoes' && sizeVal) {
      const stockVal = String(p.stock != null ? p.stock : p.stockQuantity || '0')
      setClothingStocks({
        'XS': sizeVal === 'XS' ? stockVal : '0',
        'S': sizeVal === 'S' ? stockVal : '0',
        'M': sizeVal === 'M' ? stockVal : '0',
        'L': sizeVal === 'L' ? stockVal : '0',
        'XL': sizeVal === 'XL' ? stockVal : '0',
        'XXL': sizeVal === 'XXL' ? stockVal : '0',
        'One Size': sizeVal === 'One Size' ? stockVal : '0',
      })
    }
  }

  useEffect(() => {
    if (!id) return

    // 1. Try to load from route state
    const stateProduct = location.state?.product
    if (stateProduct && String(stateProduct.id) === String(id)) {
      populateProduct(stateProduct)
      return
    }

    // 2. Try to load from sessionStorage
    const stored = sessionStorage.getItem('ezshop_admin_products')
    if (stored) {
      try {
        const list = JSON.parse(stored)
        const found = list.find((p: any) => String(p.id) === String(id))
        if (found) {
          populateProduct(found)
          return
        }
      } catch (e) {
        console.error('Error parsing stored products', e)
      }
    }

    // 3. Fallback to fetching (hits breakpoints on backend if in development)
    if (!adminToken) return
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
        populateProduct({
          id: String(p.productid),
          name: p.name,
          description: p.description,
          category: p.category,
          basePrice: p.basePrice,
          stockQuantity: p.stockQuantity,
          size: p.size,
          image: p.image,
        })
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
    
    let finalSize: string
    let finalStock: number

    if (form.category === 'Shoes') {
      const stocks: Record<string, number> = {}
      let totalStock = 0
      shoeSizes.forEach((s) => {
        const qty = Number(shoeStocks[s]) || 0
        stocks[s] = qty
        totalStock += qty
      })
      finalSize = JSON.stringify(stocks)
      finalStock = totalStock
    } else {
      const stocks: Record<string, number> = {}
      let totalStock = 0
      sizes.forEach((s) => {
        const qty = Number(clothingStocks[s]) || 0
        stocks[s] = qty
        totalStock += qty
      })
      finalSize = JSON.stringify(stocks)
      finalStock = totalStock
    }

    const formData = new FormData()
    formData.append('product[name]', form.name)
    formData.append('product[category]', form.category)
    formData.append('product[size]', finalSize)
    formData.append('product[basePrice]', form.basePrice)
    formData.append('product[stockQuantity]', String(finalStock))
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
        },
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMsg = errorData.errors ? errorData.errors.join(', ') : 'Unknown error'
        throw new Error(errorMsg)
      }

      try {
        const p = await res.json()
        const getProductImage = (catVal?: string) => {
          const cat = (catVal || "").toLowerCase();
          if (cat.includes("shirt") || cat.includes("top") || cat.includes("tee")) {
            return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop";
          }
          if (cat.includes("pant") || cat.includes("jean") || cat.includes("trouser") || cat.includes("bottom")) {
            return "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop";
          }
          if (cat.includes("shoe") || cat.includes("sneaker") || cat.includes("footwear")) {
            return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop";
          }
          if (cat.includes("jacket") || cat.includes("coat") || cat.includes("outerwear")) {
            return "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop";
          }
          return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&h=200&fit=crop";
        };

        const mappedItem = {
          id: String(p.productid),
          name: p.name,
          slug: p.name.toLowerCase().replace(/\s+/g, "-"),
          description: p.description || "",
          price: Number(p.basePrice),
          stock: Number(p.stockQuantity),
          category: p.category,
          image: p.image || getProductImage(p.category),
          rating: 0,
          reviewCount: 0,
          createdAt: p.created_at || new Date().toISOString(),
          size: p.size,
        }

        const stored = sessionStorage.getItem('ezshop_admin_products')
        let list = stored ? JSON.parse(stored) : []
        if (!Array.isArray(list)) list = []

        let updatedList
        if (isEdit) {
          updatedList = list.map((item: any) => String(item.id) === String(id) ? mappedItem : item)
        } else {
          updatedList = [mappedItem, ...list]
        }
        sessionStorage.setItem('ezshop_admin_products', JSON.stringify(updatedList))
      } catch (e) {
        console.error('Failed to update sessionStorage products cache:', e)
      }

      navigate('/admin/products')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Failed to save product: ${msg}`)
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
            <div className="relative">
              <select
                id="category"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="flex h-10 w-full appearance-none items-center justify-between rounded-radius border border-border bg-input px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 leading-relaxed cursor-pointer"
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
            </div>
          </div>
          
          {form.category === 'Shoes' ? (
            <div className="sm:col-span-2 bg-surface p-4 rounded-radius border border-border/20 space-y-3">
              <Label className="font-semibold text-sm">Shoe Sizing Inventory (EUR Sizing)</Label>
              <p className="text-xs text-muted-foreground">Input the stock count for each EUR shoe size. The total stock will be calculated automatically.</p>
              <div className="grid grid-cols-4 gap-3">
                {shoeSizes.map((size) => (
                  <div key={size} className="space-y-1">
                    <Label htmlFor={`size-${size}`} className="text-xs">EU {size}</Label>
                    <Input
                      id={`size-${size}`}
                      type="number"
                      min="0"
                      value={shoeStocks[size]}
                      onChange={(e) => {
                        const val = cleanNumberString(e.target.value)
                        setShoeStocks(prev => ({ ...prev, [size]: val }))
                      }}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="sm:col-span-2 bg-surface p-4 rounded-radius border border-border/20 space-y-3">
              <Label className="font-semibold text-sm">Clothing Sizing Inventory (Standard Sizing)</Label>
              <p className="text-xs text-muted-foreground">Input the stock count for each size. Entering a quantity for "One Size" disables other sizes, and vice versa. Total stock is calculated automatically.</p>
              <div className="grid grid-cols-4 gap-3">
                {sizes.map((size) => {
                  const hasSpecificSizes = Object.keys(clothingStocks).some(
                    (key) => key !== 'One Size' && Number(clothingStocks[key]) > 0
                  )
                  const hasOneSize = Number(clothingStocks['One Size']) > 0
                  const isDisabled = size === 'One Size' ? hasSpecificSizes : hasOneSize

                  return (
                    <div key={size} className="space-y-1">
                      <Label htmlFor={`size-${size}`} className="text-xs">{size}</Label>
                      <Input
                        id={`size-${size}`}
                        type="number"
                        min="0"
                        value={clothingStocks[size]}
                        disabled={isDisabled}
                        onChange={(e) => {
                          const val = cleanNumberString(e.target.value)
                          if (size === 'One Size') {
                            if (Number(val) > 0) {
                              setClothingStocks({
                                'XS': '0',
                                'S': '0',
                                'M': '0',
                                'L': '0',
                                'XL': '0',
                                'XXL': '0',
                                'One Size': val,
                              })
                            } else {
                              setClothingStocks((prev) => ({ ...prev, 'One Size': val }))
                            }
                          } else {
                            if (Number(val) > 0) {
                              setClothingStocks((prev) => ({
                                ...prev,
                                [size]: val,
                                'One Size': '0',
                              }))
                            } else {
                              setClothingStocks((prev) => ({ ...prev, [size]: val }))
                            }
                          }
                        }}
                        required
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Detailed product specifications, materials, fit..." />
          </div>
          <div>
            <Label htmlFor="basePrice">Base Price (RM)</Label>
            <Input id="basePrice" type="number" step="0.01" max="99999999.99" value={form.basePrice} onChange={(e) => {
              let val = e.target.value;
              if (Number(val) > 99999999.99) val = "99999999.99";
              update('basePrice', val);
            }} required />
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
        
        <div className="flex justify-center sm:justify-start gap-3 pt-4">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
        </div>
      </form>
    </Container>
  )
}
