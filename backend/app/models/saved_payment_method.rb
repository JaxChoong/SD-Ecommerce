class SavedPaymentMethod < ApplicationRecord
  BRANDS = %w[Visa Mastercard Amex].freeze
  EXPIRY_RE = /\A\d{2}\/\d{2}\z/.freeze
  LAST4_RE = /\A\d{4}\z/.freeze

  validates :brand,  presence: true, inclusion: { in: BRANDS }
  validates :last4,  presence: true, format: { with: LAST4_RE }
  validates :expiry, presence: true, format: { with: EXPIRY_RE }
  validates :holder, presence: true, length: { minimum: 2, maximum: 100 }

  scope :default,  -> { where(is_default: true) }
  scope :recent,   -> { order(created_at: :desc) }

  def self.serialize(record)
    {
      id:         record.id,
      brand:      record.brand,
      last4:      record.last4,
      expiry:     record.expiry,
      holder:     record.holder,
      is_default: record.is_default,
      created_at: record.created_at.iso8601,
    }
  end
end
