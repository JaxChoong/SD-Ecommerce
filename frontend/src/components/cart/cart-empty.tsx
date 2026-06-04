import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '../ui/button'

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2 leading-relaxed">Your cart is empty</h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Looks like you have not added anything yet.
      </p>
      <Button asChild>
        <Link to="/products">Browse Products</Link>
      </Button>
    </div>
  )
}
