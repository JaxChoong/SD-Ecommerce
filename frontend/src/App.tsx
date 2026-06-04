import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from './components/ui/toast'
import { Header } from './components/layout/header'
import { Footer } from './components/layout/footer'
import { MobileNav } from './components/layout/mobile-nav'
import Home from './pages/Home'
import ProductListing from './pages/ProductListing'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Coupons from './pages/Coupons'
import AccountDashboard from './pages/account/Dashboard'
import AccountOrders from './pages/account/Orders'
import AccountAddresses from './pages/account/Addresses'
import AccountPaymentMethods from './pages/account/PaymentMethods'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminProductForm from './pages/admin/ProductForm'
import AdminCoupons from './pages/admin/Coupons'
import AdminCouponForm from './pages/admin/CouponForm'
import type { ReactNode } from 'react'

function AdminRoute({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  if (role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastContainer>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductListing />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/coupons" element={<Coupons />} />
                  <Route path="/account" element={<AccountDashboard />} />
                  <Route path="/account/orders" element={<AccountOrders />} />
                  <Route path="/account/addresses" element={<AccountAddresses />} />
                  <Route path="/account/payment-methods" element={<AccountPaymentMethods />} />
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                  <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
                  <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
                  <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
                  <Route path="/admin/coupons/new" element={<AdminRoute><AdminCouponForm /></AdminRoute>} />
                  <Route path="/admin/coupons/:id/edit" element={<AdminRoute><AdminCouponForm /></AdminRoute>} />
                </Routes>
              </main>
              <Footer />
              <MobileNav />
            </div>
          </ToastContainer>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
