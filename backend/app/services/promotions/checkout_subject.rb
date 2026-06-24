module Promotions
  class CheckoutSubject
    attr_accessor :items, :subtotal, :shipping, :coupon, :coupons, :discount, :shipping_discount

    def initialize(items:, subtotal:, shipping:, coupon: nil, coupons: nil)
      @items            = items
      @subtotal         = subtotal.to_f
      @shipping         = shipping.to_f
      @coupon           = coupon
      @coupons          = coupons || [ coupon ].compact
      @discount         = 0.0
      @shipping_discount = 0.0
      @observers        = []
    end

    def attach(observer)
      @observers << observer unless @observers.include?(observer)
    end

    def detach(observer)
      @observers.delete(observer)
    end

    def calculate
      pricing = Promotions::BaseCartPricing.new(@subtotal, @shipping)

      @coupons.each do |promo|
        if promo.discountTarget == "shipping"
          pricing = Promotions::ShippingDiscountDecorator.new(pricing, promo, @items)
        else
          pricing = Promotions::PromotionContext.new(pricing, promo, @items)
          if promo.type == "percentage"
            pricing.set_discount_strategy(Promotions::PercentageStrategy.new(promo))
          elsif promo.type == "fixed"
            pricing.set_discount_strategy(Promotions::FixedAmountStrategy.new(promo))
          end
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

    def notify
      @observers.each { |observer| observer.update(self) }
    end
  end
end
