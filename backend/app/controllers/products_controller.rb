class ProductsController < ApplicationController
  # GET /products
  def index
    products = Product.all

    if params[:category].present? && params[:category] != "all"
      products = products.where("LOWER(category) = ?", params[:category].downcase)
    end

    if params[:search].present?
      q = "%#{params[:search].downcase}%"
      products = products.where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", q, q)
    end

    if params[:minPrice].present?
      products = products.where("\"basePrice\" >= ?", params[:minPrice].to_f)
    end

    if params[:maxPrice].present?
      products = products.where("\"basePrice\" <= ?", params[:maxPrice].to_f)
    end

    if params[:inStock] == "true"
      products = products.where("\"stockQuantity\" > 0")
    end

    if params[:onSale] == "true"
      # There is no originalPrice column in db schema, so no products are on sale
      products = products.none
    end

    if params[:sort] == "price-asc"
      products = products.order(basePrice: :asc)
    elsif params[:sort] == "price-desc"
      products = products.order(basePrice: :desc)
    elsif params[:sort] == "name-asc"
      products = products.order(name: :asc)
    else
      products = products.order(created_at: :desc)
    end

    mapped = products.map do |p|
      {
        id: p.productid.to_s,
        name: p.name,
        slug: p.name.downcase.strip.gsub(/[^a-z0-9]+/, "-").gsub(/-+$/, ""),
        description: p.description || "",
        price: p.basePrice.to_f,
        stock: p.stockQuantity,
        category: p.category,
        size: p.size,
        image: p.image || "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&h=200&fit=crop",
        rating: 4.5,
        reviewCount: 12
      }
    end

    render json: mapped
  end

  # GET /products/:id
  def show
    # Fetch by productid if numeric, else decode slug to match name
    product = if params[:id].match?(/^\d+$/)
                Product.find_by(productid: params[:id])
              else
                target_slug = params[:id].to_s.strip.downcase
                Product.all.find do |p|
                  p.name.downcase.strip.gsub(/[^a-z0-9]+/, "-").gsub(/-+$/, "") == target_slug
                end
              end

    if product
      render json: {
        id: product.productid.to_s,
        name: product.name,
        slug: params[:id],
        description: product.description || "",
        price: product.basePrice.to_f,
        stock: product.stockQuantity,
        category: product.category,
        size: product.size,
        image: product.image || "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200&h=200&fit=crop",
        rating: 4.5,
        reviewCount: 12
      }
    else
      render json: { error: "Product not found" }, status: :not_found
    end
  end
end
