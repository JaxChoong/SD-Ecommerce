module Promotions
  class ShippingDiscountObserver
    def update(checkout)
      coupon = checkout.coupon
      return unless coupon

      if coupon.type == 'percentage'
        checkout.shipping_discount = (checkout.shipping * coupon.discountValue.to_f) / 100.0
      elsif coupon.type == 'fixed'
        checkout.shipping_discount = [checkout.shipping, coupon.discountValue.to_f].min
      end
    end
  end
end
