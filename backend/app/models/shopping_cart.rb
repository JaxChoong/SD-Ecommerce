class ShoppingCart < ApplicationRecord
  self.primary_key = :cartid

  validates :status, presence: true, inclusion: { in: %w[active ordered abandoned] }
  validates :createdAt, presence: true

  belongs_to :customer
  has_many :cart_items, foreign_key: :cart_id, dependent: :destroy

  def serialize_for_api
    {
      cartId: cartid,
      customerId: customer_id,
      status: status,
      createdAt: createdAt,
      items: cart_items.map(&:serialize_for_api)
    }
  end
end
