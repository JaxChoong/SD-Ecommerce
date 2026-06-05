import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ShoppingCart, Menu, Search, X, LogOut } from 'lucide-react'
import { Container } from './container'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const { role, logout } = useAuth()
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

  const handleLogout = async () => {
    await logout()
    setAdminOpen(false)
    navigate('/admin/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <Container>
        <div className="grid grid-cols-3 h-16 items-center">
          <div className="flex items-center">
            <Link to={role === 'admin' ? '/admin' : '/'} className="text-xl font-semibold tracking-tight">
              EZShop
            </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-8 text-sm text-muted-foreground">
            {role === 'admin' ? (
              <>
                <Link to="/admin" className="hover:text-foreground transition-colors font-medium">Dashboard</Link>
                <Link to="/admin/products" className="hover:text-foreground transition-colors font-medium">Products</Link>
                <Link to="/admin/coupons" className="hover:text-foreground transition-colors font-medium">Coupons</Link>
                <Link to="/admin/purchases" className="hover:text-foreground transition-colors font-medium">Purchases</Link>
              </>
            ) : (
              <>
                <Link to="/products" className="hover:text-foreground transition-colors font-medium">Shop</Link>
                <Link to="/coupons" className="hover:text-foreground transition-colors font-medium">Coupons</Link>
              </>
            )}
          </nav>

          <div className="flex items-center justify-end gap-3">
            {/* Search option only for customers */}
            {role !== 'admin' && (
              <button
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
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
                        <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-surface font-medium" onClick={() => setAdminOpen(false)}>Admin Dashboard</Link>
                        <Link to="/admin/products" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>Manage Products</Link>
                        <Link to="/admin/coupons" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>Manage Coupons</Link>
                        <Link to="/admin/purchases" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>Recent Purchases</Link>
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-1.5 w-full text-left px-4 py-2 text-sm text-error hover:bg-surface"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/account" className="block px-4 py-2 text-sm hover:bg-surface font-medium" onClick={() => setAdminOpen(false)}>My Account</Link>
                        <Link to="/account/orders" className="block px-4 py-2 text-sm hover:bg-surface" onClick={() => setAdminOpen(false)}>Order History</Link>
                        <div className="border-t border-border my-1" />
                        <Link to="/admin/login" className="block px-4 py-2 text-sm hover:bg-surface text-primary" onClick={() => setAdminOpen(false)}>
                          Admin Portal
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Shopping Cart only for customers */}
            {role !== 'admin' && (
              <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {searchOpen && role !== 'admin' && (
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
              {role === 'admin' ? (
                <>
                  <Link to="/admin" className="px-2 py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                  <Link to="/admin/products" className="px-2 py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>Products</Link>
                  <Link to="/admin/coupons" className="px-2 py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>Coupons</Link>
                  <Link to="/admin/purchases" className="px-2 py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>Purchases</Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="flex items-center gap-1.5 px-2 py-2 text-sm text-left text-error hover:text-primary"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/products" className="px-2 py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>Shop</Link>
                  <Link to="/coupons" className="px-2 py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>Coupons</Link>
                  <Link to="/cart" className="px-2 py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>Cart</Link>
                  <Link to="/account" className="px-2 py-2 text-sm hover:text-primary" onClick={() => setMenuOpen(false)}>My Account</Link>
                  <Link to="/admin/login" className="px-2 py-2 text-sm hover:text-primary text-primary" onClick={() => setMenuOpen(false)}>
                    Admin Portal
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </Container>
    </header>
  )
}
