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

  def subtotal
    order_items.sum { |item| item.unitPrice * item.quantity }.round(2)
  end

  def base_shipping
    sub = subtotal
    sub >= 100.0 ? 0.0 : (sub > 0.0 ? 10.0 : 0.0)
  end

  def shipping_discount
    order_promotions.select { |op| op.promotion&.discountTarget == 'shipping' }.sum(&:discountApplied).round(2)
  end

  def shipping_cost
    [(base_shipping - shipping_discount).to_f, 0.0].max.round(2)
  end

  def item_discount
    order_promotions.reject { |op| op.promotion&.discountTarget == 'shipping' }.sum(&:discountApplied).round(2)
  end
end

