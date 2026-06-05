module Admin
  class PromotionService
    def list_promotions
      Promotion.order(created_at: :desc)
    end

    def get_promotion(promotionid)
      Promotion.find(promotionid)
    end

    def create_promotion(params)
      Promotion.create!(params)
    end

    def update_promotion(promotionid, params)
      promotion = Promotion.find(promotionid)
      promotion.update!(params)
      promotion
    end

    def delete_promotion(promotionid)
      promotion = Promotion.find(promotionid)
      promotion.destroy!
    end
  end
end
