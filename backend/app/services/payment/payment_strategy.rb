module Payment
  class PaymentStrategy
    def process_payment(amount)
      raise NotImplementedError, "Subclasses of Payment::PaymentStrategy must implement #process_payment"
    end
  end
end
