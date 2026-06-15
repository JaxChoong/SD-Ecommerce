class Product < ApplicationRecord
  self.primary_key = :productid

  validates :name, presence: true
  validates :category, presence: true
  validates :size, presence: true
  validates :basePrice, presence: true, numericality: { greater_than_or_equal_to: 0, less_than: 100_000_000 }
  validates :stockQuantity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :image, presence: true

  has_many :cart_items, foreign_key: :product_id, dependent: :restrict_with_error
  has_many :order_items, foreign_key: :product_id, dependent: :restrict_with_error
end
