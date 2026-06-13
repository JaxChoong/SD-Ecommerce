module Promotions
  class FixedDiscountDecorator < PromotionDecorator
    def calculate_total
      [@wrapped_component.calculate_total - current_discount, 0.0].max
    end

    def discount
      @wrapped_component.discount + current_discount
    end

    private

    def current_discount
      applicable_sum = compute_applicable_sum
      remaining_applicable = [0.0, applicable_sum - @wrapped_component.discount].max
      [remaining_applicable, @coupon.discountValue.to_f].min
    end

    def compute_applicable_sum
      return subtotal if @coupon.category.nil? || @coupon.category.to_s.empty? || @coupon.category.downcase == 'all'

      @items.sum do |item|
        product = item[:product]
        if product && product.category.downcase == @coupon.category.downcase
          item[:price].to_f * item[:quantity].to_i
        else
          0.0
        end
      end
    end
  end
end
