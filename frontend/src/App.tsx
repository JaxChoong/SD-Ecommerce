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
import AdminPurchases from './pages/admin/Purchases'
import AdminLogin from './pages/admin/Login'
import type { ReactNode } from 'react'

function AdminRoute({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  if (role !== 'admin') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function UserRoute({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  if (role === 'admin') return <Navigate to="/admin" replace />
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
                  {/* Customer / Guest routes protected from Admin access */}
                  <Route path="/" element={<UserRoute><Home /></UserRoute>} />
                  <Route path="/products" element={<UserRoute><ProductListing /></UserRoute>} />
                  <Route path="/products/:slug" element={<UserRoute><ProductDetail /></UserRoute>} />
                  <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
                  <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
                  <Route path="/checkout/success" element={<UserRoute><CheckoutSuccess /></UserRoute>} />
                  <Route path="/coupons" element={<UserRoute><Coupons /></UserRoute>} />
                  <Route path="/account" element={<UserRoute><AccountDashboard /></UserRoute>} />
                  <Route path="/account/orders" element={<UserRoute><AccountOrders /></UserRoute>} />
                  <Route path="/account/addresses" element={<UserRoute><AccountAddresses /></UserRoute>} />
                  <Route path="/account/payment-methods" element={<UserRoute><AccountPaymentMethods /></UserRoute>} />

                  {/* Admin boundaries */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                  <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
                  <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
                  <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
                  <Route path="/admin/coupons/new" element={<AdminRoute><AdminCouponForm /></AdminRoute>} />
                  <Route path="/admin/coupons/:id/edit" element={<AdminRoute><AdminCouponForm /></AdminRoute>} />
                  <Route path="/admin/purchases" element={<AdminRoute><AdminPurchases /></AdminRoute>} />
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
