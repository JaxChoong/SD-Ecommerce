module Api
  class CheckoutController < ApplicationController
    class PaymentFailedError < StandardError; end

    def create
      customer_params  = params.require(:customer).permit(:name, :email, :phone, :shoppingAddress)
      items_params     = params.require(:items).map { |item| item.permit(:productId, :quantity, :unitPrice).to_h }
      payment_params   = params.require(:paymentMethod).permit(:type, :provider, :bank).to_h
      coupon_codes = if params[:couponCodes].is_a?(Array)
                       params[:couponCodes]
                     elsif params[:couponCode].present?
                       params[:couponCode].to_s.split(',').map(&:strip)
                     else
                       []
                     end
      coupon_codes = coupon_codes.map(&:upcase).reject(&:blank?).uniq

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

      # ── Resolve coupons (optional) ──────────────────────────────────────────
      promotions = []
      coupon_codes.each do |code|
        promo = Promotion.find_by("UPPER(\"promoCode\") = ?", code)

        if promo.nil? || !promo.IsActive || promo.endDate < Time.current
          render json: { success: false, error: "Coupon code #{code} is invalid or has expired." }, status: :unprocessable_entity
          return
        end

        if promo.usageLimit.present? && promo.usageCount >= promo.usageLimit
          render json: { success: false, error: "Coupon #{code} has reached its usage limit." }, status: :unprocessable_entity
          return
        end
        promotions << promo
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
        coupons:  promotions
      )
      result           = checkout_calc.calculate
      discount_amount  = result[:discount]
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

          # Save the applied promotions and increment their usage counters
          current_pricing = Promotions::BaseCartPricing.new(subtotal, base_shipping)
          promotions.each do |promo|
            prev_discount = current_pricing.discount
            prev_shipping_discount = current_pricing.shipping_discount

            if promo.discountTarget == 'shipping'
              current_pricing = Promotions::ShippingDiscountDecorator.new(current_pricing, promo, resolved_items)
              discount_val = current_pricing.shipping_discount - prev_shipping_discount
            else
              if promo.type == 'percentage'
                current_pricing = Promotions::PercentageDiscountDecorator.new(current_pricing, promo, resolved_items)
              elsif promo.type == 'fixed'
                current_pricing = Promotions::FixedDiscountDecorator.new(current_pricing, promo, resolved_items)
              end
              discount_val = current_pricing.discount - prev_discount
            end

            OrderPromotion.create!(
              order:           order,
              promotion:       promo,
              discountApplied: discount_val.round(2)
            )
            promo.increment!(:usageCount)
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

      begin
        OrderMailer.receipt(order).deliver_now
      rescue => e
        Rails.logger.error("Failed to send order receipt email for order ##{order.orderid}: #{e.message}")
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

