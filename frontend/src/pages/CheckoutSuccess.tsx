import { useSearchParams, Link } from 'react-router'
import { Container } from '../components/layout/container'
import { Button } from '../components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('id') || 'ORD-000000'

  return (
    <Container className="py-16">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Thank you for your purchase. Your order <span className="font-medium text-foreground">{orderId}</span> has been placed successfully.
        </p>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          You will receive a confirmation email shortly with your order details and delivery information.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg">
            <Link to="/products">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/account/orders">View Order History</Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}
