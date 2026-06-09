module PaymentStrategy
  class CheckoutContext
    SUPPORTED_METHODS = %w[credit_card ewallet online_banking].freeze

    def initialize
      @payment_strategy = nil
    end

    def set_payment_method(strategy)
      @payment_strategy = strategy
    end

    def execute_checkout(amount)
      if @payment_strategy.nil?
        puts "No payment method selected."
        return { success: false, error: "No payment method selected." }
      end

      @payment_strategy.process_payment(amount)
    end

    def self.build_strategy(method)
      case method.to_s
      when "credit_card"
        CreditCardStrategy.new
      when "ewallet"
        EwalletStrategy.new
      when "online_banking"
        OnlineBankingStrategy.new
      else
        nil
      end
    end
  end
end
