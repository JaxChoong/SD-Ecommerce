module Promotions
  class CheckoutSubject
    attr_accessor :items, :subtotal, :shipping, :coupon, :discount, :shipping_discount

    def initialize(items:, subtotal:, shipping:, coupon:)
      @items            = items  
      @subtotal         = subtotal.to_f
      @shipping         = shipping.to_f
      @coupon           = coupon
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

    def notify
      @observers.each { |observer| observer.update(self) }
    end
  end
end
