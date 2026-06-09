class CreateOrderItems < ActiveRecord::Migration[8.1]
  def change
    create_table :order_items, id: false do |t|
      t.primary_key :orderitemid
      t.references :order, type: :bigint, null: false, foreign_key: { to_table: :orders, primary_key: :orderid }
      t.references :product, type: :bigint, null: false, foreign_key: { to_table: :products, primary_key: :productid }
      t.integer :quantity, null: false
      t.decimal :unitPrice, precision: 10, scale: 2, null: false

      t.timestamps
    end
  end
end
