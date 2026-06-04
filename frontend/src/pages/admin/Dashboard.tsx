import { Link } from 'react-router'
import { Container } from '../../components/layout/container'
import { Package, Tags } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8 leading-relaxed">Manage your products and promotional campaigns.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/products" className="bg-surface rounded-radius p-6 hover:bg-surface/80 transition-colors">
          <Package className="h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Manage Products</h3>
          <p className="text-sm text-muted-foreground">Add, edit, and remove products from your inventory.</p>
        </Link>
        <Link to="/admin/coupons" className="bg-surface rounded-radius p-6 hover:bg-surface/80 transition-colors">
          <Tags className="h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Manage Coupons</h3>
          <p className="text-sm text-muted-foreground">Create and configure promotional campaigns.</p>
        </Link>
      </div>
    </Container>
  )
}
