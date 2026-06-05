module Admin
  class InventoryService
    def list_products
      Product.order(created_at: :desc)
    end

    def get_product(productid)
      Product.find(productid)
    end

    def create_product(params)
      Product.create!(params)
    end

    def update_product(productid, params)
      product = Product.find(productid)
      product.update!(params)
      product
    end

    def delete_product(productid)
      product = Product.find(productid)
      product.destroy!
    end
  end
end
