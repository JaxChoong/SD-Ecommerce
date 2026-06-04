import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import type { Product } from '../../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchProducts = () => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    fetch(`/api/admin/products${params}`)
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/products/new"><Plus className="h-4 w-4 mr-1" /> New Product</Link>
        </Button>
      </div>
      <Input
        placeholder="Search products..."
        className="max-w-xs mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-radius bg-surface overflow-hidden shrink-0">
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{p.category}</td>
                    <td className="py-3 pr-4">RM{p.price.toFixed(2)}</td>
                    <td className="py-3 pr-4">{p.stock}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/products/${p.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
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
            {products.map((p) => (
              <div key={p.id} className="bg-surface rounded-radius p-3 flex gap-3">
                <div className="h-16 w-16 rounded-radius bg-background overflow-hidden shrink-0">
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} • {p.stock} in stock</p>
                  <p className="text-sm font-medium mt-1">RM{p.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                    <Link to={`/admin/products/${p.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="h-8 w-8 p-0">
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
