module Promotions
  class FixedDiscountObserver
    def update(checkout)
      coupon = checkout.coupon
      return unless coupon

      applicable_sum = 0.0
      if coupon.category == 'all'
        applicable_sum = checkout.subtotal
      else
        checkout.items.each do |item|
          product = item[:product]
          if product && product.category.downcase == coupon.category.downcase
            applicable_sum += item[:price].to_f * item[:quantity].to_i
          end
        end
      end

      checkout.discount = [applicable_sum, coupon.discountValue.to_f].min
    end
  end
end
