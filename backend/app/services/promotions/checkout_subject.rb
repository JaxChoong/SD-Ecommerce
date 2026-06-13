# Observer Pattern — CheckoutSubject (the Subject / Observable)
#
# Holds the cart state and a list of DiscountObserver instances.
# Calling `calculate` attaches the correct observer based on the coupon type
# and target, then notifies all observers to compute the discount.
#
# Usage:
#   checkout = Promotions::CheckoutSubject.new(
#     items:    [{ product: product, price: 49.90, quantity: 2 }],
#     subtotal: 99.80,
#     shipping: 10.0,
#     coupon:   promotion   # a Promotion ActiveRecord object, or nil
#   )
#   result = checkout.calculate
#   # => { discount: 9.98, shipping_discount: 0.0, total: 89.82 }
module Promotions
  class CheckoutSubject
    attr_accessor :items, :subtotal, :shipping, :coupon, :discount, :shipping_discount

    def initialize(items:, subtotal:, shipping:, coupon:)
      @items            = items  # Array of { product: Product, price: Float, quantity: Integer }
      @subtotal         = subtotal.to_f
      @shipping         = shipping.to_f
      @coupon           = coupon
      @discount         = 0.0
      @shipping_discount = 0.0
      @observers        = []
    end

    # Attach an observer (idempotent — won't add duplicates).
    def attach(observer)
      @observers << observer unless @observers.include?(observer)
    end

    # Detach a previously attached observer.
    def detach(observer)
      @observers.delete(observer)
    end

    # Run the full discount calculation using the Decorator Pattern:
    #   1. Start with the concrete base cart pricing component.
    #   2. Dynamically wrap it with decorators depending on the coupon target/type.
    #   3. Execute calculation and retrieve the breakdown.
    def calculate
      pricing = Promotions::BaseCartPricing.new(@subtotal, @shipping)

      if @coupon
        if @coupon.discountTarget == 'shipping'
          pricing = Promotions::ShippingDiscountDecorator.new(pricing, @coupon, @items)
        elsif @coupon.type == 'percentage'
          pricing = Promotions::PercentageDiscountDecorator.new(pricing, @coupon, @items)
        elsif @coupon.type == 'fixed'
          pricing = Promotions::FixedDiscountDecorator.new(pricing, @coupon, @items)
        end
      end

      @total             = pricing.calculate_total
      @discount          = pricing.discount.round(2)
      @shipping_discount = pricing.shipping_discount.round(2)

      {
        discount:          @discount,
        shipping_discount: @shipping_discount,
        total:             @total.round(2)
      }
    end

    private

    # Broadcast the update event to every registered observer.
    def notify
      @observers.each { |observer| observer.update(self) }
    end
  end
end
