class CreateShoppingCarts < ActiveRecord::Migration[8.1]
  def change
    create_table :shopping_carts, id: false do |t|
      t.primary_key :cartid
      t.references :customer, type: :bigint, null: false, foreign_key: { to_table: :customers, primary_key: :customerid }
      t.string :status, null: false, default: "ordered"
      t.datetime :createdAt, null: false

      t.timestamps
    end
  end
end
