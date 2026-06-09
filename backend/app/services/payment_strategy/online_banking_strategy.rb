module PaymentStrategy
  class OnlineBankingStrategy < PaymentStrategy
    def process_payment(amount)
      puts "[OnlineBankingStrategy] Processing online banking payment of RM #{format('%.2f', amount)}"
      sleep(rand(0.3..0.6))

      {
        success: true,
        method: "online_banking",
        transaction_id: "TXN-#{SecureRandom.hex(4).upcase}",
        processed_at: Time.current.iso8601
      }
    end
  end
end
