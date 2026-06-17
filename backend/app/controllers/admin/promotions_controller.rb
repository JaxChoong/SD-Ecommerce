module Admin
  class PromotionsController < BaseController
    before_action :set_proxy

    # GET /admin/promotions
    def index
      filters = {
        category: params[:category],
        search: params[:search]
      }
      debugger if Rails.env.development?
      # method called through proxy
      promotions = @proxy.list_promotions(filters)
      render json: promotions
    end

    # GET /admin/promotions/:id
    def show
      debugger if Rails.env.development?
      # method called through proxy
      promotion = @proxy.get_promotion(params[:id])
      render json: promotion
    end

    # POST /admin/promotions
    def create
      debugger if Rails.env.development?
      # method called through proxy
      promotion = @proxy.create_promotion(promotion_params)
      render json: promotion, status: :created
    end

    # PUT/PATCH /admin/promotions/:id
    def update
      debugger if Rails.env.development?
      # method called through proxy
      promotion = @proxy.update_promotion(params[:id], promotion_params)
      render json: promotion
    end

    # DELETE /admin/promotions/:id
    def destroy
      debugger if Rails.env.development?
      # method called through proxy
      @proxy.delete_promotion(params[:id])
      head :no_content
    end

    private

    def set_proxy
      @proxy = build_proxy(Admin::PromotionService.new)
    end

    def promotion_params
      params.require(:promotion).permit(:name, :type, :discountValue, :promoCode, :category, :startDate, :endDate, :IsActive, :usageLimit, :usageCount, :discountTarget)
    end
  end
end
