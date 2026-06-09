class CartItem < ApplicationRecord
  self.primary_key = :cartitemid

  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :unitPrice, presence: true, numericality: { greater_than_or_equal_to: 0 }

  belongs_to :cart, class_name: "ShoppingCart"
  belongs_to :product

  def subtotal
    (unitPrice.to_f * quantity).round(2)
  end

  def serialize_for_api
    {
      cartItemId: cartitemid,
      cartId: cart_id,
      productId: product_id,
      productName: product&.name,
      productImage: product&.image,
      unitPrice: unitPrice.to_f,
      quantity: quantity,
      subtotal: subtotal
    }
  end
end
