import { useState, useEffect } from 'react'
import { Container } from '../../components/layout/container'
import { Card, CardContent } from '../../components/ui/card'
import { ClipboardList, Clock, Mail, MapPin, Phone, User } from 'lucide-react'

interface OrderItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
  paymentMethod: { type: string; provider?: string }
  status: 'pending' | 'paid' | 'failed' | 'expired'
  shippingAddress: {
    fullName: string
    phone: string
    email: string
    address: string
    city: string
    state: string
    postcode: string
  }
  createdAt: string
}

export default function AdminPurchases() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    setLoading(true)
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => {
        // Sort orders by date descending
        const sorted = (data || []).sort(
          (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sorted)
      })
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders()
  }, [])

  return (
    <Container className="py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-semibold">Recent Purchases</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading recent purchases...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No customer purchases found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border border-border/40 overflow-hidden shadow-sm">
              <div className="bg-surface/50 border-b border-border/40 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">Order ID: {order.id}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    order.status === 'paid' ? 'bg-success/10 text-success' :
                    order.status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-error/10 text-error'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                  <p className="font-semibold text-base">RM{order.total.toFixed(2)}</p>
                </div>
              </div>
              <CardContent className="p-4 sm:p-6 grid gap-6 md:grid-cols-3">
                {/* Items Section */}
                <div className="md:col-span-2 space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Items</h3>
                  <div className="divide-y divide-border/30">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="h-12 w-12 rounded bg-surface overflow-hidden shrink-0">
                          <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} • RM{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">RM{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border/30 pt-3 flex flex-col items-end gap-1.5 text-sm">
                    <div className="flex justify-between w-full max-w-xs text-muted-foreground">
                      <span>Subtotal</span>
                      <span>RM{order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between w-full max-w-xs text-success">
                        <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                        <span>-RM{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between w-full max-w-xs text-muted-foreground">
                      <span>Shipping</span>
                      <span>RM{order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-xs font-semibold text-foreground border-t border-border/30 pt-1.5 mt-1">
                      <span>Total Paid</span>
                      <span>RM{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer / Shipping Section */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/30 pt-4 md:pt-0 md:pl-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Customer</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{order.shippingAddress.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{order.shippingAddress.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{order.shippingAddress.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/20">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shipping Address</h3>
                    <div className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.postcode} {order.shippingAddress.city}</p>
                        <p>{order.shippingAddress.state}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/20">
                    <p className="text-xs text-muted-foreground">Payment Method: <span className="font-medium text-foreground capitalize">{order.paymentMethod.type} {order.paymentMethod.provider ? `(${order.paymentMethod.provider.toUpperCase()})` : ''}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}
