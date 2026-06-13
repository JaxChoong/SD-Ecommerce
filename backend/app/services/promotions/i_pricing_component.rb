module Promotions
  class IPricingComponent
    # Calculate the final total price after all stacked discounts are applied.
    # @return [Float] the total price
    def calculate_total
      raise NotImplementedError, "#{self.class}#calculate_total must be implemented"
    end

    # Return the accumulated base price discount applied.
    # @return [Float] the discount amount
    def discount
      raise NotImplementedError, "#{self.class}#discount must be implemented"
    end

    # Return the accumulated shipping discount applied.
    # @return [Float] the shipping discount amount
    def shipping_discount
      raise NotImplementedError, "#{self.class}#shipping_discount must be implemented"
    end
  end
end
