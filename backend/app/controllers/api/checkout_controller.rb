module Api
  class CheckoutController < ApplicationController
    class PaymentFailedError < StandardError; end

    def create
      customer_params  = params.require(:customer).permit(:name, :email, :phone, :shoppingAddress)
      items_params     = params.require(:items).map { |item| item.permit(:productId, :quantity, :unitPrice).to_h }
      payment_params   = params.require(:paymentMethod).permit(:type, :provider, :bank).to_h
      coupon_code      = params[:couponCode].presence&.upcase&.strip

      method_type = payment_params["type"].to_s
      provider    = payment_params["provider"].presence
      bank        = payment_params["bank"].presence

      if items_params.empty?
        render json: { success: false, error: "Cart is empty." }, status: :unprocessable_entity
        return
      end

      unless PaymentStrategy::CheckoutContext::SUPPORTED_METHODS.include?(method_type)
        render json: { success: false, error: "Unsupported payment method: #{method_type}" }, status: :unprocessable_entity
        return
      end

      # ── Resolve coupon (optional) ──────────────────────────────────────────
      promotion = nil
      if coupon_code.present?
        promotion = Promotion.find_by(promoCode: coupon_code)

        if promotion.nil? || !promotion.IsActive || promotion.endDate < Time.current
          render json: { success: false, error: "Coupon code is invalid or has expired." }, status: :unprocessable_entity
          return
        end

        if promotion.usageLimit.present? && promotion.usageCount >= promotion.usageLimit
          render json: { success: false, error: "This coupon has reached its usage limit." }, status: :unprocessable_entity
          return
        end
      end

      # ── Observer-based discount calculation ────────────────────────────────
      # Build product-resolved item list for category-aware discounts
      resolved_items = items_params.filter_map do |item|
        product = Product.find_by(productid: item["productId"])
        next unless product
        { product: product, price: item["unitPrice"].to_f, quantity: item["quantity"].to_i }
      end

      subtotal      = resolved_items.sum { |i| i[:price] * i[:quantity] }.round(2)
      base_shipping = subtotal >= 100.0 ? 0.0 : (subtotal > 0.0 ? 10.0 : 0.0)

      # CheckoutSubject (Subject) attaches the right DiscountObserver and notifies it
      checkout_calc = Promotions::CheckoutSubject.new(
        items:    resolved_items,
        subtotal: subtotal,
        shipping: base_shipping,
        coupon:   promotion
      )
      result           = checkout_calc.calculate
      discount_amount  = (promotion&.discountTarget == "shipping") ? result[:shipping_discount] : result[:discount]
      final_total      = result[:total]

      if final_total < 0
        render json: { success: false, error: "Invalid total after discount." }, status: :unprocessable_entity
        return
      end

      # ── Database transaction ───────────────────────────────────────────────
      order            = nil
      gateway_result   = nil
      payment_error    = nil

      begin
        ActiveRecord::Base.transaction do
          customer = Customer.create!(
            name:            customer_params[:name],
            email:           customer_params[:email],
            phone:           customer_params[:phone],
            shoppingAddress: customer_params[:shoppingAddress]
          )

          cart = ShoppingCart.create!(
            customer: customer,
            status:   "ordered",
            createdAt: Time.current
          )

          items_params.each do |item|
            product = Product.find_by(productid: item["productId"])
            next unless product
            CartItem.create!(
              cart:      cart,
              product:   product,
              quantity:  item["quantity"].to_i,
              unitPrice: item["unitPrice"].to_f
            )
          end

          order = Order.create!(
            customer:      customer,
            createdAt:     Time.current,
            finalTotal:    final_total,
            status:        "pending",
            paymentMethod: method_type
          )

          items_params.each do |item|
            product = Product.find_by(productid: item["productId"])
            next unless product
            OrderItem.create!(
              order:     order,
              product:   product,
              quantity:  item["quantity"].to_i,
              unitPrice: item["unitPrice"].to_f
            )
          end

          # Save the applied promotion and increment its usage counter
          if promotion && discount_amount > 0
            OrderPromotion.create!(
              order:           order,
              promotion:       promotion,
              discountApplied: discount_amount
            )
            promotion.increment!(:usageCount)
          end

          # Execute payment via Strategy pattern
          strategy = PaymentStrategy::CheckoutContext.build_strategy(method_type)
          context  = PaymentStrategy::CheckoutContext.new
          context.set_payment_method(strategy)
          gateway_result = context.execute_checkout(final_total)

          unless gateway_result[:success]
            payment_error = gateway_result[:error] || "Payment failed"
            raise PaymentFailedError, payment_error
          end

          Payment.create!(
            order:         order,
            method:        method_type,
            status:        "paid",
            amount:        final_total,
            processedAt:   Time.current,
            transactionId: gateway_result[:transaction_id]
          )

          order.update!(status: "paid")
        end
      rescue PaymentFailedError
        render json: { success: false, error: payment_error }, status: :unprocessable_entity
        return
      rescue ActiveRecord::RecordInvalid => e
        render json: { success: false, error: e.message, errors: e.record.errors.full_messages }, status: :unprocessable_entity
        return
      end

      response_payload = order.serialize_for_api
      response_payload[:paymentMethod] = {
        type:     method_type,
        provider: provider,
        bank:     bank
      }
      render json: response_payload, status: :created
    end
  end
end

