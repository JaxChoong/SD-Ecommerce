class PromotionsController < ApplicationController
  # GET /promotions
  def index
    # Fetch active promotions where IsActive is true and date is valid
    current_time = Time.current
    promotions = Promotion.where(IsActive: true)
                          .where("\"startDate\" <= ?", current_time)
                          .where("\"endDate\" >= ?", current_time)

    mapped = promotions.map do |c|
      {
        id: c.promotionid.to_s,
        code: c.promoCode,
        description: c.name || '',
        discountType: c.type,
        discountValue: c.discountValue.to_f,
        category: c.category,
        expiresAt: c.endDate,
        isActive: c.IsActive,
        discountTarget: c.discountTarget
      }
    end

    render json: mapped
  end
end
