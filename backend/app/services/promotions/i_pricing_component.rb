module Promotions
  class IPricingComponent
    def calculate_total
      raise NotImplementedError, "#{self.class}#calculate_total must be implemented"
    end

    def discount
      raise NotImplementedError, "#{self.class}#discount must be implemented"
    end

    def shipping_discount
      raise NotImplementedError, "#{self.class}#shipping_discount must be implemented"
    end
  end
end
