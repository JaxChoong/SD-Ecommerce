module Promotions
  class PromotionDecorator < IPricingComponent
    attr_reader :wrapped_component, :coupon, :items

    def initialize(wrapped_component, coupon, items)
      @wrapped_component = wrapped_component
      @coupon = coupon
      @items = items
    end

    def calculate_total
      @wrapped_component.calculate_total
    end

    def discount
      @wrapped_component.discount
    end

    def shipping_discount
      @wrapped_component.shipping_discount
    end

    def subtotal
      if @wrapped_component.respond_to?(:subtotal)
        @wrapped_component.subtotal
      else
        0.0
      end
    end

    def shipping
      if @wrapped_component.respond_to?(:shipping)
        @wrapped_component.shipping
      else
        0.0
      end
    end
  end
end
