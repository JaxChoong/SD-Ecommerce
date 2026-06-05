class Product < ApplicationRecord
  self.primary_key = :productid

  validates :name, presence: true
  validates :category, presence: true
  validates :size, presence: true
  validates :basePrice, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :stockQuantity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :image, presence: true
end
