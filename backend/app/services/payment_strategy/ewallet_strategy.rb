module PaymentStrategy
  class EwalletStrategy < PaymentStrategy
    def process_payment(amount)
      puts "[EWalletStrategy] Processing e-wallet payment of RM #{format('%.2f', amount)}"
      sleep(rand(0.1..0.3))

      {
        success: true,
        method: "ewallet",
        transaction_id: "TXN-#{SecureRandom.hex(4).upcase}",
        processed_at: Time.current.iso8601
      }
    end
  end
end
