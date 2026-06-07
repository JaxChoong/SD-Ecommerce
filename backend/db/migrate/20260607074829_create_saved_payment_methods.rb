class CreateSavedPaymentMethods < ActiveRecord::Migration[8.1]
  def change
    create_table :saved_payment_methods do |t|
      t.string  :brand,      null: false, limit: 16
      t.string  :last4,      null: false, limit: 4
      t.string  :expiry,     null: false, limit: 5
      t.string  :holder,     null: false, limit: 100
      t.boolean :is_default, null: false, default: false

      t.timestamps
    end

    add_index :saved_payment_methods, :is_default
    add_index :saved_payment_methods, :created_at
  end
end
