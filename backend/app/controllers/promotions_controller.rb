class PromotionsController < ApplicationController
  # GET /promotions
  # Returns all currently active promotions for the customer-facing coupons page.
  def index
    current_time = Time.current
    promotions = Promotion.where(IsActive: true)
                          .where("\"startDate\" <= ?", current_time)
                          .where("\"endDate\" >= ?", current_time)

    mapped = promotions.map do |c|
      {
        id: c.promotionid.to_s,
        code: c.promoCode,
        description: c.name || "",
        discountType: c.type,
        discountValue: c.discountValue.to_f,
        category: c.category,
        expiresAt: c.endDate,
        isActive: c.IsActive,
        discountTarget: c.discountTarget,
        usageCount: c.usageCount,
        usageLimit: c.usageLimit
      }
    end

    render json: mapped
  end

  # POST /promotions/validate  →  used by /api/coupons/validate (Vite proxy)
  # Validates a promo code against the current cart and returns the discount breakdown.
  # Uses the Observer pattern (Promotions::CheckoutSubject) to compute the amount.
  def validate
    code        = params[:code].to_s.strip.upcase
    cart_total  = params[:cartTotal].to_f
    items_params = params[:items] || []

    coupon = Promotion.find_by(promoCode: code)

    unless coupon
      render json: { isValid: false, errors: { code: "NOT_FOUND", message: "Coupon \"#{code}\" not found." } }
      return
    end

    unless coupon.IsActive
      render json: { isValid: false, errors: { code: "NOT_APPLICABLE", message: "This coupon is no longer active." } }
      return
    end

    if coupon.endDate < Time.current
      render json: { isValid: false, errors: { code: "EXPIRED", message: "This coupon has expired." } }
      return
    end

    if coupon.usageLimit.present? && coupon.usageCount >= coupon.usageLimit
      render json: { isValid: false, errors: { code: "MAX_USES", message: "This coupon has reached its maximum usage limit." } }
      return
    end

    # Resolve cart items to Product records for category-aware discount logic
    resolved_items = []
    items_params.each do |item_param|
      product = Product.find_by(productid: item_param[:productId])
      if product
        resolved_items << {
          product:  product,
          price:    item_param[:price].to_f,
          quantity: item_param[:quantity].to_i
        }
      end
    end

    # Compute base shipping (same thresholds as the frontend)
    base_shipping = cart_total >= 100.0 ? 0.0 : (cart_total > 0.0 ? 10.0 : 0.0)

    # === Observer Pattern ===
    # CheckoutSubject is the Subject; the correct concrete DiscountObserver
    # is attached inside `calculate` based on the coupon type + target.
    checkout = Promotions::CheckoutSubject.new(
      items:    resolved_items,
      subtotal: cart_total,
      shipping: base_shipping,
      coupon:   coupon
    )
    result = checkout.calculate

    # If the coupon targets a specific category but no items in that category exist
    if coupon.discountTarget == "base_price" && coupon.category != "all" && result[:discount] == 0.0
      render json: {
        isValid: false,
        errors: {
          code:    "NOT_APPLICABLE",
          message: "This coupon only applies to products in the #{coupon.category} category."
        }
      }
      return
    end

    applied_amount = coupon.discountTarget == "shipping" ? result[:shipping_discount] : result[:discount]

    render json: {
      isValid: true,
      discount: {
        type:          coupon.type,
        value:         coupon.discountValue.to_f,
        appliedAmount: applied_amount,
        target:        coupon.discountTarget
      }
    }
  end

  # POST /promotions/use  →  used by /api/coupons/use (Vite proxy)
  # Increments the usageCount on a promotion after a successful checkout.
  def use
    code   = params[:code].to_s.strip.upcase
    coupon = Promotion.find_by(promoCode: code)

    if coupon
      coupon.increment!(:usageCount)
      render json: { success: true, usageCount: coupon.usageCount }
    else
      render json: { error: "Coupon \"#{code}\" not found" }, status: :not_found
    end
  end
end
