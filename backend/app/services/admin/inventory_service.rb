module Admin
  class InventoryService
    def list_products(filters = {})
      query = Product.all

      if filters[:category].present? && filters[:category] != 'all'
        query = query.where("LOWER(category) = ?", filters[:category].downcase)
      end

      if filters[:search].present?
        q = "%#{filters[:search].downcase}%"
        query = query.where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", q, q)
      end

      if filters[:minPrice].present?
        query = query.where("\"basePrice\" >= ?", filters[:minPrice].to_f)
      end

      if filters[:maxPrice].present?
        query = query.where("\"basePrice\" <= ?", filters[:maxPrice].to_f)
      end

      query.order(created_at: :desc)
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
