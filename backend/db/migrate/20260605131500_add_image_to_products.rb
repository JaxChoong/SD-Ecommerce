class AddImageToProducts < ActiveRecord::Migration[8.1]
  def change
    add_column :products, :image, :string
  end
end
