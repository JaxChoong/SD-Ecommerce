import { Link, useLocation } from 'react-router'
import { Home, Search, ShoppingCart, User, Package, Tags, ClipboardList } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export function MobileNav() {
  const location = useLocation()
  const { itemCount } = useCart()
  const { role } = useAuth()

  const links = role === 'admin' 
    ? [
        { to: '/admin', icon: Home, label: 'Dashboard' },
        { to: '/admin/products', icon: Package, label: 'Products' },
        { to: '/admin/coupons', icon: Tags, label: 'Coupons' },
        { to: '/admin/purchases', icon: ClipboardList, label: 'Recent Orders' },
      ]
    : [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/products', icon: Search, label: 'Search' },
        { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
        { to: '/account', icon: User, label: 'Account' },
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background md:hidden">
      <div className="flex w-full items-center h-14">
        {links.map(({ to, icon: Icon, label, badge }) => {
          const isActive = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex-1 h-full flex flex-col items-center justify-center gap-0.5 text-[10px] sm:text-xs transition-colors ${
                isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge != null && badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-medium text-primary-foreground">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
