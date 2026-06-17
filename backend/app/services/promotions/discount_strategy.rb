module Promotions
  class DiscountStrategy
    def apply_discount(current_total)
      raise NotImplementedError, "#{self.class}#apply_discount must be implemented"
    end
  end
end
