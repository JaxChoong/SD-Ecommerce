class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments, id: false do |t|
      t.primary_key :paymentid
      t.references :order, type: :bigint, null: false, foreign_key: { to_table: :orders, primary_key: :orderid }
      t.string :method, null: false
      t.string :status, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.datetime :processedAt, null: false
      t.string :transactionId

      t.timestamps
    end
  end
end
