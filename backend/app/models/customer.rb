class Customer < ApplicationRecord
  self.primary_key = :customerid

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true, format: { with: /\A01[0-9]-?[0-9]{7,8}\z/ }
  validates :shoppingAddress, presence: true

  has_many :shopping_carts, foreign_key: :customer_id, dependent: :destroy
  has_many :orders, foreign_key: :customer_id, dependent: :destroy

  def serialize_for_api
    {
      customerId: customerid,
      name: name,
      email: email,
      phone: phone,
      shoppingAddress: shoppingAddress
    }
  end
end
