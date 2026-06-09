class OrderPromotion < ApplicationRecord
  belongs_to :order
  belongs_to :promotion

  validates :discountApplied, presence: true, numericality: { greater_than_or_equal_to: 0 }

  def serialize_for_api
    {
      orderPromotionId: id,
      orderId: order_id,
      promotionId: promotion_id,
      discountApplied: discountApplied.to_f
    }
  end
end
