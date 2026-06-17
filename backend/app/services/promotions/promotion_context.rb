module Promotions
  class PromotionContext < PromotionDecorator
    attr_accessor :discount_strategy

    def initialize(wrapped_component, coupon, items)
      super(wrapped_component, coupon, items)
    end

    def set_discount_strategy(strategy)
      @discount_strategy = strategy
    end

    def calculate_total
      [@wrapped_component.calculate_total - current_discount, 0.0].max
    end

    def discount
      @wrapped_component.discount + current_discount
    end

    private

    def current_discount
      return 0.0 unless @discount_strategy

      applicable_sum = compute_applicable_sum
      
      if @coupon.type == 'percentage'
        current_total = applicable_sum
      elsif @coupon.type == 'fixed'
        current_total = [0.0, applicable_sum - @wrapped_component.discount].max
      else
        current_total = 0.0
      end

      @discount_strategy.apply_discount(current_total)
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
