import { useState, useEffect } from 'react'
import { Container } from '../../components/layout/container'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, Tags } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface AnalyticsData {
  total_revenue: number
  total_orders: number
  aov: number
  total_customers: number
  top_products: { id: number, name: string, image: string, total_sold: number }[]
  low_stock_count: number
  top_coupons: { id: number, code: string, usage_count: number }[]
  total_discount: number
  recent_revenue: { date: string, revenue: number }[]
}

export default function AdminDashboard() {
  const { adminToken } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!adminToken) return
    fetch('/api/admin/analytics', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch analytics')
        return r.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [adminToken])

  if (loading) {
    return (
      <Container className="py-8">
        <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>
        <p className="text-muted-foreground">Loading analytics...</p>
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container className="py-8">
        <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>
        <p className="text-error">Error loading analytics: {error}</p>
      </Container>
    )
  }

  const maxRevenue = Math.max(...data.recent_revenue.map(d => Number(d.revenue) || 0), 1)

  return (
    <Container className="py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here's what's happening with your store today.</p>
      </div>

      {data.low_stock_count > 0 && (
        <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-radius flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-medium">You have {data.low_stock_count} product(s) with low stock (less than 5 items remaining).</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM{Number(data.total_revenue).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">From successful orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.total_orders}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid and completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM{Number(data.aov).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Revenue per order</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.total_customers}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique active buyers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-end gap-2 mt-4">
              {data.recent_revenue.map((day, i) => {
                const heightPct = (Number(day.revenue) / maxRevenue) * 100
                return (
                  <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-foreground text-background text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      RM{Number(day.revenue).toFixed(2)}
                    </div>
                    <div 
                      className="w-full bg-primary/80 hover:bg-primary transition-all rounded-t-sm"
                      style={{ height: `${Math.max(heightPct, 1)}%` }}
                    />
                    <div className="text-[10px] text-muted-foreground mt-2 truncate w-full text-center">
                      {day.date.split(',')[0]}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Coupons Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-4 w-4" /> Top Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-sm text-muted-foreground">Total Discounts Given:</span>
                <span className="font-semibold text-success">RM{Number(data.total_discount).toFixed(2)}</span>
              </div>
              {data.top_coupons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No coupons used yet.</p>
              ) : (
                data.top_coupons.map(coupon => (
                  <div key={coupon.id} className="flex items-center justify-between">
                    <div className="font-mono text-sm font-medium bg-surface px-2 py-1 rounded border border-border/50">
                      {coupon.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Used {coupon.usage_count} times
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-surface/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.top_products.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">No products sold yet.</td>
                  </tr>
                ) : (
                  data.top_products.map(product => (
                    <tr key={product.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img src={product.image} alt="" className="h-10 w-10 rounded object-cover border border-border/50" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-surface border border-border/50" />
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {product.total_sold}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
