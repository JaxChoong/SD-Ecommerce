module Promotions
  class PercentageDiscountDecorator < PromotionDecorator
    def calculate_total
      [@wrapped_component.calculate_total - current_discount, 0.0].max
    end

    # SOLID Principle: OCP (Open/Closed Principle) - We can introduce new promotion decorators
    # (e.g., Buy One Free One) without modifying existing decorators or BaseCartPricing.
    # SOLID Principle: LSP (Liskov Substitution Principle) - Any decorator subclassing
    # PromotionDecorator can stand in place of IPricingComponent without breaking the app.
    def discount
      # DECORATOR PATTERN BREAKPOINT
      # Place debugger here to show recursive decorator calls.
      debugger if Rails.env.development?
      @wrapped_component.discount + current_discount
    end

    private

    def current_discount
      applicable_sum = compute_applicable_sum
      (applicable_sum * @coupon.discountValue.to_f) / 100.0
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
