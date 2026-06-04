import { Link } from 'react-router'
import { Container } from '../components/layout/container'
import { Button } from '../components/ui/button'
import { ProductGrid } from '../components/product/product-grid'
import { ProductSkeleton } from '../components/product/product-skeleton'
import { useProducts } from '../hooks/useProducts'

const categories = [
  { name: 'Lighting', slug: 'Lighting' },
  { name: 'Home', slug: 'Home' },
  { name: 'Electronics', slug: 'Electronics' },
  { name: 'Stationery', slug: 'Stationery' },
  { name: 'Accessories', slug: 'Accessories' },
  { name: 'Kitchen', slug: 'Kitchen' },
]

export default function Home() {
  const { products, isLoading } = useProducts({ sort: 'featured' })
  const featured = products.slice(0, 8)

  return (
    <div className="leading-relaxed">
      <section className="bg-surface py-12 sm:py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground mb-3">New Arrivals</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Thoughtful Products for Everyday Life
            </h1>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md text-sm sm:text-base">
              Curated essentials and timeless designs — from minimalist home goods to modern accessories.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/products">Shop Now</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link to="/coupons">View Coupons</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="whitespace-nowrap rounded-full bg-surface px-5 py-2 text-sm transition-colors hover:bg-surface/80 leading-relaxed"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Featured Products</h2>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <ProductGrid products={featured} />
          )}
        </Container>
      </section>

      <section className="bg-surface py-12">
        <Container>
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-3">Save with Coupons</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Unlock exclusive discounts and free shipping with our promo codes.
            </p>
            <Button variant="outline" asChild>
              <Link to="/coupons">Browse Coupons</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  )
}
