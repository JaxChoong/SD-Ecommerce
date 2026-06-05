module Admin
  class InventoryController < BaseController
    before_action :set_proxy

    # GET /admin/inventory
    def index
      products = @proxy.list_products
      render json: products
    end

    # GET /admin/inventory/:id
    def show
      product = @proxy.get_product(params[:id])
      render json: product
    end

    # POST /admin/inventory
    def create
      product = @proxy.create_product(product_params)
      render json: product, status: :created
    end

    # PUT/PATCH /admin/inventory/:id
    def update
      product = @proxy.update_product(params[:id], product_params)
      render json: product
    end

    # DELETE /admin/inventory/:id
    def destroy
      @proxy.delete_product(params[:id])
      head :no_content
    end

    private

    def set_proxy
      @proxy = build_proxy(Admin::InventoryService.new)
    end

    def product_params
      params.require(:product).permit(:name, :category, :size, :basePrice, :stockQuantity, :description)
    end
  end
end
