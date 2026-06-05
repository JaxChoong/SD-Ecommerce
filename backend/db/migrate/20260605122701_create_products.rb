class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products, id: false do |t|
      t.primary_key :productid
      t.string :name, null: false
      t.string :category, null: false
      t.string :size, null: false
      t.decimal :basePrice, precision: 10, scale: 2, null: false
      t.integer :stockQuantity, null: false, default: 0
      t.text :description

      t.timestamps
    end
  end
end
