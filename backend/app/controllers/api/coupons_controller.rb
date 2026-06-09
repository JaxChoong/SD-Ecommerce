module Api
  class CouponsController < ApplicationController
    # POST /api/coupons/validate
    def validate
      code = params[:code].to_s.upcase.strip
      cart_total = params[:cartTotal].to_f

      if code.blank?
        render json: { isValid: false, errors: { code: "NOT_FOUND", message: "Promo code is required" } }, status: :unprocessable_entity
        return
      end

      promotion = Promotion.where("UPPER(\"promoCode\") = ?", code).first

      if promotion.nil?
        render json: { isValid: false, errors: { code: "NOT_FOUND", message: "Promo code not found" } }, status: :not_found
        return
      end

      unless promotion.IsActive && Time.current.between?(promotion.startDate, promotion.endDate)
        render json: { isValid: false, errors: { code: "EXPIRED", message: "This promo code has expired" } }, status: :unprocessable_entity
        return
      end

      if promotion.usageLimit.present? && promotion.usageCount >= promotion.usageLimit
        render json: { isValid: false, errors: { code: "MAX_USES", message: "This promo code has reached its usage limit" } }, status: :unprocessable_entity
        return
      end

      applied = compute_discount(promotion, cart_total)
      if applied[:requirement] && cart_total < applied[:requirement]
        render json: { isValid: false, errors: { code: "MIN_PURCHASE", message: "Cart total does not meet minimum purchase", requirement: applied[:requirement] } }, status: :unprocessable_entity
        return
      end

      render json: {
        isValid: true,
        discount: {
          type: promotion.type,
          value: promotion.discountValue.to_f,
          appliedAmount: applied[:appliedAmount],
          target: promotion.discountTarget
        }
      }
    end

    private

    def compute_discount(promotion, cart_total)
      if promotion.type == "percentage"
        amount = (cart_total * promotion.discountValue.to_f / 100).round(2)
        { appliedAmount: amount }
      else
        amount = [ promotion.discountValue.to_f, cart_total ].min
        { appliedAmount: amount.round(2) }
      end
    end
  end
end
