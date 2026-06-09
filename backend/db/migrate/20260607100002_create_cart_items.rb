class CreateCartItems < ActiveRecord::Migration[8.1]
  def change
    create_table :cart_items, id: false do |t|
      t.primary_key :cartitemid
      t.references :cart, type: :bigint, null: false, foreign_key: { to_table: :shopping_carts, primary_key: :cartid }
      t.references :product, type: :bigint, null: false, foreign_key: { to_table: :products, primary_key: :productid }
      t.integer :quantity, null: false
      t.decimal :unitPrice, precision: 10, scale: 2, null: false

      t.timestamps
    end
  end
end
