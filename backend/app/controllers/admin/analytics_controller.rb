module Admin
  class AnalyticsController < BaseController
    def index
      paid_orders = Order.where(status: ['paid', 'completed'])

      total_revenue = paid_orders.sum(:finalTotal)
      total_orders = paid_orders.count
      aov = total_orders > 0 ? (total_revenue / total_orders).round(2) : 0
      total_customers = paid_orders.select(:customer_id).distinct.count

      top_products = Product.joins(:order_items)
                            .select('products.productid, products.name, products.image, sum(order_items.quantity) as total_sold')
                            .group('products.productid, products.name, products.image')
                            .order('total_sold DESC')
                            .limit(5)
                            .map { |p| { id: p.productid, name: p.name, image: p.image, total_sold: p.total_sold } }

      low_stock_count = Product.where('"stockQuantity" < ?', 5).count

      top_coupons = Promotion.joins(:order_promotions)
                             .select('promotions.promotionid, promotions."promoCode", count(order_promotions.id) as usage_count')
                             .group('promotions.promotionid, promotions."promoCode"')
                             .order('usage_count DESC')
                             .limit(5)
                             .map { |p| { id: p.promotionid, code: p.promoCode, usage_count: p.usage_count } }

      total_discount = OrderPromotion.sum(:discountApplied)

      # Recent Revenue (last 7 days)
      recent_revenue_data = paid_orders
                              .where('orders.created_at >= ?', 6.days.ago.beginning_of_day)
                              .group("DATE(orders.created_at)")
                              .sum(:finalTotal)

      recent_revenue = (0..6).map do |i|
        date = (6 - i).days.ago.to_date
        {
          date: date.strftime('%a, %b %d'),
          revenue: recent_revenue_data[date] || 0
        }
      end

      render json: {
        total_revenue: total_revenue,
        total_orders: total_orders,
        aov: aov,
        total_customers: total_customers,
        top_products: top_products,
        low_stock_count: low_stock_count,
        top_coupons: top_coupons,
        total_discount: total_discount,
        recent_revenue: recent_revenue
      }
    end
  end
end
