module Promotions
  class Checkout
    attr_accessor :items, :subtotal, :shipping, :coupon, :discount, :shipping_discount

    def initialize(items:, subtotal:, shipping:, coupon:)
      @items = items # Array of { product: Product, price: Float, quantity: Integer }
      @subtotal = subtotal.to_f
      @shipping = shipping.to_f
      @coupon = coupon
      @discount = 0.0
      @shipping_discount = 0.0
      @observers = []
    end

    def attach(observer)
      @observers << observer unless @observers.include?(observer)
    end

    def detach(observer)
      @observers.delete(observer)
    end

    def calculate
      @discount = 0.0
      @shipping_discount = 0.0

      if @coupon
        if @coupon.discountTarget == 'shipping'
          attach(Promotions::ShippingDiscountObserver.new)
        elsif @coupon.type == 'percentage'
          attach(Promotions::PercentageDiscountObserver.new)
        elsif @coupon.type == 'fixed'
          attach(Promotions::FixedDiscountObserver.new)
        end
      end

      notify

      @discount = @discount.round(2)
      @shipping_discount = @shipping_discount.round(2)

      {
        discount: @discount,
        shipping_discount: @shipping_discount,
        total: (@subtotal - @discount + (@shipping - @shipping_discount)).round(2)
      }
    end

    private

    def notify
      @observers.each do |observer|
        observer.update(self)
      end
    end
  end
end
