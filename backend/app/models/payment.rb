class Payment < ApplicationRecord
  self.primary_key = :paymentid

  validates :method, presence: true, inclusion: { in: %w[credit_card ewallet online_banking] }
  validates :status, presence: true, inclusion: { in: %w[pending paid failed refunded] }
  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :processedAt, presence: true

  belongs_to :order

  def serialize_for_api
    {
      paymentId: paymentid,
      orderId: order_id,
      method: method,
      status: status,
      amount: amount.to_f,
      processedAt: processedAt.iso8601,
      transactionId: transactionId
    }
  end
end
