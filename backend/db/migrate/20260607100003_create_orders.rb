class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders, id: false do |t|
      t.primary_key :orderid
      t.references :customer, type: :bigint, null: false, foreign_key: { to_table: :customers, primary_key: :customerid }
      t.datetime :createdAt, null: false
      t.decimal :finalTotal, precision: 10, scale: 2, null: false
      t.string :status, null: false, default: "pending"
      t.string :paymentMethod, null: false

      t.timestamps
    end
  end
end
