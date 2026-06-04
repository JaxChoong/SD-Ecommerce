import { Container } from '../../components/layout/container'
import { Package } from 'lucide-react'

const mockOrders = [
  { id: 'ORD-001', date: '1 Jun 2026', status: 'Delivered', total: 138.40, items: 2 },
  { id: 'ORD-002', date: '21 May 2026', status: 'Delivered', total: 143.20, items: 1 },
  { id: 'ORD-003', date: '4 Jun 2026', status: 'Processing', total: 244.00, items: 2 },
]

export default function Orders() {
  return (
    <Container className="py-6 sm:py-8">
      <h1 className="text-2xl font-semibold mb-6">Order History</h1>
      {mockOrders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div key={order.id} className="bg-surface rounded-radius p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Package className="h-8 w-8 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.date} • {order.items} item{order.items > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium">RM{order.total.toFixed(2)}</p>
                <p className={`text-xs ${order.status === 'Delivered' ? 'text-success' : 'text-warning'}`}>{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
