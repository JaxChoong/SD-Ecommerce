module Promotions
  class PercentageStrategy < DiscountStrategy
    attr_reader :coupon

    def initialize(coupon)
      @coupon = coupon
    end

    def apply_discount(current_total)
      # STRATEGY PATTERN BREAKPOINT
      # Place debugger here to show execution of the percentage calculation.
      debugger if Rails.env.development?
      
      (current_total * @coupon.discountValue.to_f) / 100.0
    end
  end
end
