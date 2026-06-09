module PaymentStrategy
  class PaymentStrategy
    def process_payment(amount)
      raise NotImplementedError, "Subclasses of PaymentStrategy::PaymentStrategy must implement #process_payment"
    end
  end
end
