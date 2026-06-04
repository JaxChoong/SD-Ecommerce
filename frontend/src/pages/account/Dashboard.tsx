import { Link } from 'react-router'
import { Container } from '../../components/layout/container'
import { Package, MapPin, CreditCard } from 'lucide-react'

export default function Dashboard() {
  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold mb-6">My Account</h1>
      <p className="text-muted-foreground mb-8 leading-relaxed">Welcome to your account. Manage your orders, addresses, and payment methods.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/account/orders" className="bg-surface rounded-radius p-6 hover:bg-surface/80 transition-colors">
          <Package className="h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Orders</h3>
          <p className="text-sm text-muted-foreground">View your order history</p>
        </Link>
        <Link to="/account/addresses" className="bg-surface rounded-radius p-6 hover:bg-surface/80 transition-colors">
          <MapPin className="h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Addresses</h3>
          <p className="text-sm text-muted-foreground">Manage saved addresses</p>
        </Link>
        <Link to="/account/payment-methods" className="bg-surface rounded-radius p-6 hover:bg-surface/80 transition-colors">
          <CreditCard className="h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">Manage saved cards</p>
        </Link>
      </div>
    </Container>
  )
}
