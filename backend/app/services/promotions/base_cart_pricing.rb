module Promotions
  class BaseCartPricing < IPricingComponent
    attr_reader :subtotal, :shipping

    def initialize(subtotal, shipping)
      @subtotal = subtotal.to_f
      @shipping = shipping.to_f
    end

    def calculate_total
      @subtotal + @shipping
    end

    def discount
      0.0
    end

    def shipping_discount
      0.0
    end
  end
end
