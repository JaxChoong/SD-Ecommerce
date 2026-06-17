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

      resolved_items = (params[:items] || []).map do |item|
        product = Product.find_by(productid: item[:productId])
        { product: product, price: item[:price].to_f, quantity: item[:quantity].to_i }
      end

      if promotion.category.present? && promotion.category != 'all'
        has_matching_item = resolved_items.any? { |item| item[:product]&.category&.downcase == promotion.category.downcase }
        unless has_matching_item
          render json: { isValid: false, errors: { code: "NOT_APPLICABLE", message: "This coupon is not applicable to any items in your cart." } }, status: :unprocessable_entity
          return
        end
      end

      base_shipping = cart_total >= 100 ? 0.0 : (cart_total > 0 ? 10.0 : 0.0)
      pricing = Promotions::BaseCartPricing.new(cart_total, base_shipping)

      if promotion.discountTarget == 'shipping'
        pricing = Promotions::ShippingDiscountDecorator.new(pricing, promotion, resolved_items)
      else
        pricing = Promotions::PromotionContext.new(pricing, promotion, resolved_items)
        if promotion.type == 'percentage'
          pricing.set_discount_strategy(Promotions::PercentageStrategy.new(promotion))
        elsif promotion.type == 'fixed'
          pricing.set_discount_strategy(Promotions::FixedAmountStrategy.new(promotion))
        end
      end

      pricing.calculate_total
      applied_discount = (promotion.discountTarget == 'shipping') ? pricing.shipping_discount : pricing.discount

      render json: {
        isValid: true,
        discount: {
          type: promotion.type,
          value: promotion.discountValue.to_f,
          appliedAmount: applied_discount.round(2),
          target: promotion.discountTarget
        }
      }
    end
  end
end
