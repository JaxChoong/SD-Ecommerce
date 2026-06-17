module OrderNotifications
  class NotificationService < IOrderObserver
    # SOLID Principle: SRP (Single Responsibility Principle)
    # NotificationService is solely responsible for processing cart calculations,
    # stock checks, and toast notification formatting. It has no responsibility for cart mutation logic.
    def update(orderProcessor)
      # OBSERVER PATTERN IMPLEMENTATION:
      # NotificationService is the Observer. OrderProcessor.notifyObservers()
      # invokes this update(...) method whenever addItem(), removeItem(),
      # updateQuantity(), or clearCart() changes the cart.
      refresh_stock_warnings(orderProcessor)
      apply_coupon(orderProcessor)
      recalculate_totals(orderProcessor)
      prepare_user_notification(orderProcessor)
      log_cart_update(orderProcessor)
    end

    private

    def prepare_user_notification(orderProcessor)
      orderProcessor.notification_message = case orderProcessor.last_event
                                            when :item_added
                                              "Item added to cart."
                                            when :item_removed
                                              "Item removed from cart."
                                            when :quantity_updated
                                              "Cart quantity updated."
                                            when :cart_cleared
                                              "Cart cleared."
                                            else
                                              nil
                                            end
    end

    def refresh_stock_warnings(orderProcessor)
      orderProcessor.clear_stock_warnings!

      orderProcessor.items.each do |item|
        product = Product.find_by(productid: item[:product_id])
        unless product
          orderProcessor.add_stock_warning("#{item[:product_name]} is no longer available.")
          item[:quantity] = 0
          next
        end

        available_stock = stock_for(product, item[:size])
        next if item[:quantity] <= available_stock

        orderProcessor.add_stock_warning("#{product.name} quantity changed to #{available_stock} because of stock limits.")
        item[:quantity] = available_stock
      end

      orderProcessor.items.reject! { |item| item[:quantity] <= 0 }
    end

    def apply_coupon(orderProcessor)
      orderProcessor.applied_coupons = []
      orderProcessor.applied_coupon = nil
      return if orderProcessor.coupon_codes.blank?

      resolved_items = orderProcessor.items.filter_map do |item|
        product = Product.find_by(productid: item[:product_id])
        next unless product
        { product: product, price: item[:price].to_f, quantity: item[:quantity].to_i }
      end

      subtotal = orderProcessor.items.sum { |item| item[:price].to_f * item[:quantity].to_i }
      base_shipping = subtotal >= 100 ? 0.0 : (subtotal.positive? ? 10.0 : 0.0)

      current_pricing = Promotions::BaseCartPricing.new(subtotal, base_shipping)

      orderProcessor.coupon_codes.each do |code|
        promotion = Promotion.find_by("LOWER(\"promoCode\") = ?", code.to_s.downcase)

        unless promotion
          orderProcessor.applied_coupons << {
            code: code,
            isValid: false,
            errors: { code: "NOT_FOUND", message: "Promo code '#{code}' not found." }
          }
          next
        end

        unless active?(promotion)
          orderProcessor.applied_coupons << {
            code: code,
            isValid: false,
            errors: { code: "EXPIRED", message: "Promo code '#{code}' has expired or is inactive." }
          }
          next
        end

        if maxed_out?(promotion)
          orderProcessor.applied_coupons << {
            code: code,
            isValid: false,
            errors: { code: "MAX_USES", message: "Promo code '#{code}' usage limit has been reached." }
          }
          next
        end

        unless category_matches?(promotion, orderProcessor)
          orderProcessor.applied_coupons << {
            code: code,
            isValid: false,
            errors: { code: "NOT_APPLICABLE", message: "Promo code '#{code}' is not applicable to any items in your cart." }
          }
          next
        end

        prev_discount = current_pricing.discount
        prev_shipping_discount = current_pricing.shipping_discount

        if promotion.discountTarget == 'shipping'
          current_pricing = Promotions::ShippingDiscountDecorator.new(current_pricing, promotion, resolved_items)
          applied_amount = current_pricing.shipping_discount - prev_shipping_discount
        else
          current_pricing = Promotions::PromotionContext.new(current_pricing, promotion, resolved_items)
          if promotion.type == 'percentage'
            current_pricing.set_discount_strategy(Promotions::PercentageStrategy.new(promotion))
          elsif promotion.type == 'fixed'
            current_pricing.set_discount_strategy(Promotions::FixedAmountStrategy.new(promotion))
          end
          applied_amount = current_pricing.discount - prev_discount
        end

        val = {
          code: code,
          isValid: true,
          discount: {
            type: promotion.type,
            value: promotion.discountValue.to_f,
            appliedAmount: round_money(applied_amount),
            target: promotion.discountTarget
          }
        }
        orderProcessor.applied_coupons << val
        orderProcessor.applied_coupon = val
      end
    end

    def recalculate_totals(orderProcessor)
      orderProcessor.subtotal = round_money(orderProcessor.items.sum { |item| item[:price].to_f * item[:quantity].to_i })
      base_shipping = orderProcessor.subtotal >= 100 ? 0.0 : (orderProcessor.subtotal.positive? ? 10.0 : 0.0)

      resolved_items = orderProcessor.items.filter_map do |item|
        product = Product.find_by(productid: item[:product_id])
        next unless product
        { product: product, price: item[:price].to_f, quantity: item[:quantity].to_i }
      end

      pricing = Promotions::BaseCartPricing.new(orderProcessor.subtotal, base_shipping)
      valid_codes = orderProcessor.applied_coupons.select { |c| c[:isValid] }.map { |c| c[:code].to_s.downcase }

      orderProcessor.coupon_codes.each do |code|
        next unless valid_codes.include?(code.to_s.downcase)

        promotion = Promotion.find_by("LOWER(\"promoCode\") = ?", code.to_s.downcase)
        next unless promotion

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
      end

      orderProcessor.total             = round_money(pricing.calculate_total)
      orderProcessor.discount          = round_money(pricing.discount)
      orderProcessor.shipping_discount = round_money(pricing.shipping_discount)
      orderProcessor.shipping          = round_money([base_shipping - orderProcessor.shipping_discount, 0.0].max)
    end

    def log_cart_update(orderProcessor)
      message = "Cart updated: #{orderProcessor.items.count} item type(s), subtotal RM#{format('%.2f', orderProcessor.subtotal)}"
      Rails.logger.info("[ObserverPattern] #{message}")
      orderProcessor.activity_log << message
    end

    def stock_for(product, selected_size)
      size_stock = JSON.parse(product.size.to_s)
      return product.stockQuantity.to_i if size_stock.empty?

      size_stock.fetch(selected_size.to_s, 0).to_i
    rescue JSON::ParserError, TypeError
      product.stockQuantity.to_i
    end

    def active?(promotion)
      promotion.IsActive && promotion.startDate <= Time.current && promotion.endDate >= Time.current
    end

    def maxed_out?(promotion)
      promotion.usageLimit.present? && promotion.usageCount.to_i >= promotion.usageLimit.to_i
    end

    def category_matches?(promotion, orderProcessor)
      return true if promotion.category.blank? || promotion.category == "all"

      product_ids = orderProcessor.items.map { |item| item[:product_id] }
      Product.where(productid: product_ids, category: promotion.category).exists?
    end

    def applied_amount_for(promotion, subtotal)
      return promotion.discountValue.to_f if promotion.discountTarget == "shipping"

      if promotion.type == "percentage"
        subtotal * (promotion.discountValue.to_f / 100.0)
      else
        [promotion.discountValue.to_f, subtotal].min
      end
    end

    def invalid_coupon(orderProcessor, code, message)
      orderProcessor.applied_coupon = {
        isValid: false,
        errors: {
          code: code,
          message: message
        }
      }
    end

    def clear_coupon(orderProcessor)
      orderProcessor.applied_coupon = nil
      orderProcessor.applied_coupons = []
    end

    def round_money(value)
      value.to_f.round(2)
    end
  end
end
