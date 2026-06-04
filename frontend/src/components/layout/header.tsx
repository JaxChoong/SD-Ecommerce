import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ShoppingCart, Menu, Search, X } from 'lucide-react'
import { Container } from './container'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const { role, toggleRole } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <Container>
        <div className="grid grid-cols-3 h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold tracking-tight">
              EZShop
            </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <Link to="/products" className="hover:text-foreground transition-colors">Shop</Link>
            <Link to="/coupons" className="hover:text-foreground transition-colors">Coupons</Link>
          </nav>

          <div className="flex items-center justify-end gap-3">
            <button
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            <div className="relative hidden md:block">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Account"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              {adminOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAdminOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-radius border border-border bg-surface-raised py-1 shadow-lg">
                    {role === 'admin' ? (
                      <>
                        <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>Admin Dashboard</Link>
                        <Link to="/admin/products" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>Manage Products</Link>
                        <Link to="/admin/coupons" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>Manage Coupons</Link>
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={() => { toggleRole(); setAdminOpen(false) }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-surface"
                        >
                          Switch to User
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/account" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>My Account</Link>
                        <Link to="/account/orders" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>Orders</Link>
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={() => { toggleRole(); setAdminOpen(false) }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-surface"
                        >
                          Switch to Admin
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products..."
                className="flex h-10 w-full rounded-radius border border-border bg-input px-3 py-2 pl-9 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="md:hidden border-t border-border py-3">
            <nav className="flex flex-col gap-2">
              <Link to="/products" className="px-2 py-2 text-sm hover:text-[#DA3A2F]" onClick={() => setMenuOpen(false)}>Shop</Link>
              <Link to="/coupons" className="px-2 py-2 text-sm hover:text-[#DA3A2F]" onClick={() => setMenuOpen(false)}>Coupons</Link>
              <Link to="/cart" className="px-2 py-2 text-sm hover:text-[#DA3A2F]" onClick={() => setMenuOpen(false)}>Cart</Link>
              <Link to={role === 'admin' ? '/admin' : '/account'} className="px-2 py-2 text-sm hover:text-[#DA3A2F]" onClick={() => setMenuOpen(false)}>
                {role === 'admin' ? 'Admin Dashboard' : 'My Account'}
              </Link>
              <button
                onClick={() => { toggleRole(); setMenuOpen(false) }}
                className="px-2 py-2 text-sm text-left hover:text-[#DA3A2F]"
              >
                Switch to {role === 'admin' ? 'User' : 'Admin'}
              </button>
            </nav>
          </div>
        )}
      </Container>
    </header>
  )
}
