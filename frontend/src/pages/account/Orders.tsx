import { useState, useEffect } from 'react'
import { Container } from '../../components/layout/container'
import { Package } from 'lucide-react'

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

interface Order {
  id: string
  createdAt: string
  status: string
  total: number
  items: OrderItem[]
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        // Sort orders by date descending
        const sorted = (data || []).sort(
          (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sorted)
      })
      .catch((err) => console.error('Error fetching customer orders:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container className="py-6 sm:py-8">
      <h1 className="text-2xl font-semibold mb-6">Order History</h1>
      
      {loading ? (
        <p className="text-muted-foreground">Loading order history...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-MY', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            const totalItems = (order.items || []).reduce((acc, item) => acc + item.quantity, 0)
            const statusLower = (order.status || '').toLowerCase()

            return (
              <div key={order.id} className="bg-surface rounded-radius p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Package className="h-8 w-8 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate font-mono">{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateStr} • {totalItems} item{totalItems !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">RM{order.total.toFixed(2)}</p>
                  <p
                    className={`text-xs capitalize ${
                      statusLower === 'paid' || statusLower === 'delivered'
                        ? 'text-success'
                        : statusLower === 'pending' || statusLower === 'processing'
                        ? 'text-warning'
                        : 'text-error'
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Container>
  )
}
