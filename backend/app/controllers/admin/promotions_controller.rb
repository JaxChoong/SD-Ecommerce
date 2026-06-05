module Admin
  class PromotionsController < BaseController
    before_action :set_proxy

    # GET /admin/promotions
    def index
      promotions = @proxy.list_promotions
      render json: promotions
    end

    # GET /admin/promotions/:id
    def show
      promotion = @proxy.get_promotion(params[:id])
      render json: promotion
    end

    # POST /admin/promotions
    def create
      promotion = @proxy.create_promotion(promotion_params)
      render json: promotion, status: :created
    end

    # PUT/PATCH /admin/promotions/:id
    def update
      promotion = @proxy.update_promotion(params[:id], promotion_params)
      render json: promotion
    end

    # DELETE /admin/promotions/:id
    def destroy
      @proxy.delete_promotion(params[:id])
      head :no_content
    end

    private

    def set_proxy
      @proxy = build_proxy(Admin::PromotionService.new)
    end

    def promotion_params
      params.require(:promotion).permit(:name, :type, :discountValue, :promoCode, :startDate, :endDate, :IsActive)
    end
  end
end
