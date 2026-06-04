import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { useCart } from '../../context/CartContext'
import { CartItem } from './cart-item'
import { CartEmpty } from './cart-empty'

export function CartDrawer() {
  const { items, itemCount, subtotal, total } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <>
            <div className="flex-1 overflow-auto space-y-4 py-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            <Separator />
            <div className="space-y-3 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>RM{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>RM{total.toFixed(2)}</span>
              </div>
              <Button className="w-full" asChild>
                <Link to="/cart">View Cart</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
