class CreateOrderPromotions < ActiveRecord::Migration[8.1]
  def change
    create_table :order_promotions do |t|
      t.references :order, type: :bigint, null: false, foreign_key: { to_table: :orders, primary_key: :orderid }
      t.references :promotion, type: :bigint, null: false, foreign_key: { to_table: :promotions, primary_key: :promotionid }
      t.decimal :discountApplied, precision: 10, scale: 2, null: false

      t.timestamps
    end

    add_index :order_promotions, [ :order_id, :promotion_id ], unique: true, name: "index_order_promotions_on_order_and_promotion"
  end
end
