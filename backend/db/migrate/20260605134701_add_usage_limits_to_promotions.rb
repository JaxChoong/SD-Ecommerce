class AddUsageLimitsToPromotions < ActiveRecord::Migration[8.1]
  def change
    add_column :promotions, :usageLimit, :integer
    add_column :promotions, :usageCount, :integer, default: 0, null: false
  end
end
