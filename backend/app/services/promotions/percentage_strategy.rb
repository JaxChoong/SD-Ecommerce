module Promotions
  class PercentageStrategy < DiscountStrategy
    attr_reader :coupon

    def initialize(coupon)
      @coupon = coupon
    end

    def apply_discount(current_total)
      (current_total * @coupon.discountValue.to_f) / 100.0
    end
  end
end
