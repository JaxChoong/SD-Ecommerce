module Promotions
  class ShippingDiscountDecorator < PromotionDecorator
    def calculate_total
      [ @wrapped_component.calculate_total - current_shipping_discount, 0.0 ].max
    end

    def shipping_discount
      @wrapped_component.shipping_discount + current_shipping_discount
    end

    private

    def current_shipping_discount
      base_shipping = shipping
      remaining_shipping = [ 0.0, base_shipping - @wrapped_component.shipping_discount ].max

      if @coupon.type == "percentage"
        (base_shipping * @coupon.discountValue.to_f) / 100.0
      elsif @coupon.type == "fixed"
        [ remaining_shipping, @coupon.discountValue.to_f ].min
      else
        0.0
      end
    end
  end
end
