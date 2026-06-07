module Payment
  class CreditCardStrategy < PaymentStrategy
    def process_payment(amount)
      puts "[CreditCardStrategy] Processing credit card payment of RM #{format('%.2f', amount)}"
      sleep(rand(0.2..0.5))

      {
        success: true,
        method: "credit_card",
        transaction_id: "TXN-#{SecureRandom.hex(4).upcase}",
        processed_at: Time.current.iso8601
      }
    end
  end
end
