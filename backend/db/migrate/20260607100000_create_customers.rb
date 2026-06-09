class CreateCustomers < ActiveRecord::Migration[8.1]
  def change
    create_table :customers, id: false do |t|
      t.primary_key :customerid
      t.string :name, null: false
      t.string :email, null: false
      t.string :phone, null: false
      t.text :shoppingAddress, null: false

      t.timestamps
    end

    add_index :customers, :email
    add_index :customers, :phone
  end
end
