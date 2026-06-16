module PaymentStrategy
  class CheckoutContext
    SUPPORTED_METHODS = %w[credit_card ewallet online_banking].freeze

    def initialize
      @payment_strategy = nil
    end

    def set_payment_method(strategy)
      @payment_strategy = strategy
    end

    # SOLID Principle: OCP (Open/Closed Principle) - New payment processors can be added
    # without modifying the CheckoutContext class itself (just add a strategy).
    # SOLID Principle: LSP (Liskov Substitution Principle) - Any strategy inheriting
    # from PaymentStrategy can be used here interchangeably without side effects.
    def execute_checkout(amount)
      # STRATEGY PATTERN BREAKPOINT
      # Place debugger here to show dynamic delegation to the selected payment strategy.
      debugger if Rails.env.development?
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
