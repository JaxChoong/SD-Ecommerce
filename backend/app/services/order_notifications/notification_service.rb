module OrderNotifications
  class NotificationService < IOrderObserver
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
      return clear_coupon(orderProcessor) if orderProcessor.coupon_code.blank?

      promotion = Promotion.find_by("LOWER(\"promoCode\") = ?", orderProcessor.coupon_code.to_s.downcase)
      return invalid_coupon(orderProcessor, "NOT_FOUND", "Coupon code was not found.") unless promotion
      return invalid_coupon(orderProcessor, "EXPIRED", "Coupon is expired or inactive.") unless active?(promotion)
      return invalid_coupon(orderProcessor, "MAX_USES", "Coupon usage limit has been reached.") if maxed_out?(promotion)
      return invalid_coupon(orderProcessor, "NOT_APPLICABLE", "Coupon is not applicable to this cart.") unless category_matches?(promotion, orderProcessor)

      resolved_items = orderProcessor.items.filter_map do |item|
        product = Product.find_by(productid: item[:product_id])
        next unless product
        { product: product, price: item[:price].to_f, quantity: item[:quantity].to_i }
      end

      subtotal = orderProcessor.items.sum { |item| item[:price].to_f * item[:quantity].to_i }
      base_shipping = subtotal >= 100 ? 0.0 : (subtotal.positive? ? 10.0 : 0.0)

      pricing = Promotions::BaseCartPricing.new(subtotal, base_shipping)
      if promotion.discountTarget == 'shipping'
        pricing = Promotions::ShippingDiscountDecorator.new(pricing, promotion, resolved_items)
      elsif promotion.type == 'percentage'
        pricing = Promotions::PercentageDiscountDecorator.new(pricing, promotion, resolved_items)
      elsif promotion.type == 'fixed'
        pricing = Promotions::FixedDiscountDecorator.new(pricing, promotion, resolved_items)
      end

      pricing.calculate_total
      applied_amount = (promotion.discountTarget == 'shipping') ? pricing.shipping_discount : pricing.discount

      orderProcessor.applied_coupon = {
        isValid: true,
        discount: {
          type: promotion.type,
          value: promotion.discountValue.to_f,
          appliedAmount: round_money(applied_amount),
          target: promotion.discountTarget
        }
      }
    end

    def recalculate_totals(orderProcessor)
      orderProcessor.subtotal = round_money(orderProcessor.items.sum { |item| item[:price].to_f * item[:quantity].to_i })
      base_shipping = orderProcessor.subtotal >= 100 ? 0.0 : (orderProcessor.subtotal.positive? ? 10.0 : 0.0)

      resolved_items = orderProcessor.items.filter_map do |item|
        product = Product.find_by(productid: item[:product_id])
        next unless product
        { product: product, price: item[:price].to_f, quantity: item[:quantity].to_i }
      end

      promotion = nil
      if orderProcessor.applied_coupon&.dig(:isValid) && orderProcessor.coupon_code.present?
        promotion = Promotion.find_by("LOWER(\"promoCode\") = ?", orderProcessor.coupon_code.to_s.downcase)
      end

      pricing = Promotions::BaseCartPricing.new(orderProcessor.subtotal, base_shipping)
      if promotion
        if promotion.discountTarget == 'shipping'
          pricing = Promotions::ShippingDiscountDecorator.new(pricing, promotion, resolved_items)
        elsif promotion.type == 'percentage'
          pricing = Promotions::PercentageDiscountDecorator.new(pricing, promotion, resolved_items)
        elsif promotion.type == 'fixed'
          pricing = Promotions::FixedDiscountDecorator.new(pricing, promotion, resolved_items)
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
    end

    def round_money(value)
      value.to_f.round(2)
    end
  end
end
