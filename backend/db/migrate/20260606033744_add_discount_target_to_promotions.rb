class AddDiscountTargetToPromotions < ActiveRecord::Migration[8.1]
  def change
    add_column :promotions, :discountTarget, :string, default: "base_price", null: false
  end
end
