class Order < ApplicationRecord
  self.primary_key = :orderid

  validates :createdAt, presence: true
  validates :finalTotal, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true, inclusion: { in: %w[pending paid failed expired] }
  validates :paymentMethod, presence: true, inclusion: { in: %w[credit_card ewallet online_banking] }

  belongs_to :customer
  has_many :order_items, foreign_key: :order_id, dependent: :destroy
  has_many :order_promotions, foreign_key: :order_id, dependent: :destroy
  has_many :promotions, through: :order_promotions
  has_one :payment, foreign_key: :order_id, dependent: :destroy

  def serialize_for_api
    {
      orderId: orderid,
      customer: customer&.serialize_for_api,
      items: order_items.includes(:product).map(&:serialize_for_api),
      payment: payment&.serialize_for_api,
      status: status,
      finalTotal: finalTotal.to_f,
      paymentMethod: paymentMethod,
      createdAt: createdAt.iso8601,
      orderPromotions: order_promotions.includes(:promotion).map do |op|
        {
          code: op.promotion&.promoCode,
          discountTarget: op.promotion&.discountTarget,
          discountApplied: op.discountApplied.to_f
        }
      end
    }
  end
end
