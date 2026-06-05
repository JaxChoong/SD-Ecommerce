class CreatePromotions < ActiveRecord::Migration[8.1]
  def change
    create_table :promotions, id: false do |t|
      t.primary_key :promotionid
      t.string :name, null: false
      t.string :type, null: false
      t.decimal :discountValue, precision: 10, scale: 2, null: false
      t.string :promoCode, null: false
      t.datetime :startDate, null: false
      t.datetime :endDate, null: false
      t.boolean :IsActive, null: false, default: true

      t.timestamps
    end
  end
end
