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
      product_data = product_params.to_h

      if params[:product] && params[:product][:image].respond_to?(:read)
        uploaded_file = params[:product][:image]
        ext = File.extname(uploaded_file.original_filename).downcase
        unless ['.png', '.jpg', '.jpeg'].include?(ext)
          render json: { errors: ["Image must be a PNG, JPG, or JPEG file"] }, status: :unprocessable_entity
          return
        end

        directory = Rails.root.join('public', 'uploads')
        FileUtils.mkdir_p(directory)
        filename = "#{SecureRandom.uuid}#{ext}"
        File.open(directory.join(filename), 'wb') do |file|
          file.write(uploaded_file.read)
        end
        product_data['image'] = "/uploads/#{filename}"
      else
        render json: { errors: ["Image file is required"] }, status: :unprocessable_entity
        return
      end

      product = @proxy.create_product(product_data)
      render json: product, status: :created
    end

    # PUT/PATCH /admin/inventory/:id
    def update
      product_data = product_params.to_h

      if params[:product] && params[:product][:image].respond_to?(:read)
        uploaded_file = params[:product][:image]
        ext = File.extname(uploaded_file.original_filename).downcase
        unless ['.png', '.jpg', '.jpeg'].include?(ext)
          render json: { errors: ["Image must be a PNG, JPG, or JPEG file"] }, status: :unprocessable_entity
          return
        end

        directory = Rails.root.join('public', 'uploads')
        FileUtils.mkdir_p(directory)
        filename = "#{SecureRandom.uuid}#{ext}"
        File.open(directory.join(filename), 'wb') do |file|
          file.write(uploaded_file.read)
        end
        product_data['image'] = "/uploads/#{filename}"
      else
        # If it's a string, keep it. Otherwise, remove it so we don't nullify
        unless product_data['image'].is_a?(String) && product_data['image'].present?
          product_data.delete('image')
        end
      end

      product = @proxy.update_product(params[:id], product_data)
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
      params.require(:product).permit(:name, :category, :size, :basePrice, :stockQuantity, :description, :image)
    end
  end
end
