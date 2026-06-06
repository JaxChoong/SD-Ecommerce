class Promotion < ApplicationRecord
  self.primary_key = :promotionid
  self.inheritance_column = :_type_disabled

  validates :name, presence: true
  validates :type, presence: true, inclusion: { in: %w[percentage fixed] }
  validates :discountTarget, presence: true, inclusion: { in: %w[base_price shipping] }
  validates :discountValue, presence: true, numericality: { greater_than: 0 }
  validates :promoCode, presence: true, uniqueness: true
  validates :category, presence: true
  validates :startDate, presence: true
  validates :endDate, presence: true
  validates :usageLimit, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :usageCount, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validate :end_date_after_start_date

  private

  def end_date_after_start_date
    return if endDate.blank? || startDate.blank?
    if endDate < startDate
      errors.add(:endDate, "must be after the start date")
    end
  end
end
