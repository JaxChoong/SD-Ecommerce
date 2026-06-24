module OrderNotifications
  class OrderProcessor < IOrderSubject
    attr_reader :items, :activity_log, :stock_warnings
    attr_accessor :coupon_code, :coupon_codes, :applied_coupon, :applied_coupons, :subtotal, :discount, :shipping_discount,
                  :shipping, :total, :last_event, :notification_message

    def initialize(items: [], coupon_code: nil, coupon_codes: nil)
      @items = items.map { |item| normalize_item(item) }
      codes_input = if coupon_codes.is_a?(Array)
                      coupon_codes
      elsif coupon_code.present?
                      coupon_code.to_s.split(",").map(&:strip)
      else
                      []
      end
      @coupon_codes = codes_input.map(&:upcase).reject(&:blank?).uniq
      @coupon_code = @coupon_codes.last
      @applied_coupon = nil
      @applied_coupons = []
      @subtotal = 0.0
      @discount = 0.0
      @shipping_discount = 0.0
      @shipping = 0.0
      @total = 0.0
      @activity_log = []
      @stock_warnings = []
      @observers = []
      @last_event = nil
      @notification_message = nil
    end

    # SOLID Principle: OCP (Open/Closed Principle)
    # OrderProcessor can be extended with new observer classes without changing
    # its cart mutation logic. Any new observer only needs to be attached here
    # and implement update(...).
    def attachObserver(observer)
      @observers << observer unless @observers.include?(observer)
    end

    def detachObserver(observer)
      @observers.delete(observer)
    end

    # SOLID Principle: DIP (Dependency Inversion Principle)
    # OrderProcessor does not depend directly on NotificationService methods.
    # It notifies attached observers through the shared update(...) contract.
    def notifyObservers
      # OBSERVER PATTERN BREAKPOINT
      # Place debugger here during presentation.
      # Cart state changed -> notifyObservers() is executed.
     # debugger if Rails.env.development?
      @observers.each { |observer| observer.update(self) }
    end

    def addItem(product, size, quantity)
      @last_event = :item_added
      safe_quantity = quantity.to_i
      safe_quantity = 1 if safe_quantity < 1
      selected_size = size.presence || product.size
      existing_item = @items.find do |item|
        item[:product_id].to_s == product.productid.to_s && item[:size].to_s == selected_size.to_s
      end

      if existing_item
        existing_item[:quantity] += safe_quantity
      else
        @items << {
          id: SecureRandom.uuid,
          product_id: product.productid.to_s,
          product_name: product.name,
          product_image: product.image,
          size: selected_size,
          price: product.basePrice.to_f,
          quantity: safe_quantity
        }
      end

      notifyObservers
      self
    end

    def removeItem(cart_item_id)
      @last_event = :item_removed
      @items.reject! { |item| item[:id].to_s == cart_item_id.to_s }

      notifyObservers
      self
    end

    def updateQuantity(cart_item_id, quantity)
      @last_event = :quantity_updated
      safe_quantity = quantity.to_i
      safe_quantity = 1 if safe_quantity < 1
      item = @items.find { |cart_item| cart_item[:id].to_s == cart_item_id.to_s }
      item[:quantity] = safe_quantity if item

      notifyObservers
      self
    end

    def clearCart
      @last_event = :cart_cleared
      @items = []
      @coupon_code = nil
      @coupon_codes = []
      @applied_coupon = nil
      @applied_coupons = []

      notifyObservers
      self
    end

    def clear_stock_warnings!
      @stock_warnings = []
    end

    def add_stock_warning(message)
      @stock_warnings << message
    end

    def to_h
      {
        items: @items.map { |item| serialize_item(item) },
        couponCode: @coupon_code,
        couponCodes: @coupon_codes,
        appliedCoupon: @applied_coupon,
        appliedCoupons: @applied_coupons,
        subtotal: @subtotal,
        discount: @discount,
        shippingDiscount: @shipping_discount,
        shipping: @shipping,
        total: @total,
        notificationMessage: @notification_message,
        stockWarnings: @stock_warnings,
        activityLog: @activity_log
      }
    end

    def completeOrder(orderId, finalTotal)
      status = "Paid"
      OrderStore.update_status(orderId, status)

      OrderStore.find(orderId)
    end

    private

    def normalize_item(item)
      data = item.respond_to?(:to_unsafe_h) ? item.to_unsafe_h : item.to_h
      {
        id: data["id"] || data[:id] || SecureRandom.uuid,
        product_id: data["product_id"] || data[:product_id] || data["productId"] || data[:productId],
        product_name: data["product_name"] || data[:product_name] || data["productName"] || data[:productName],
        product_image: data["product_image"] || data[:product_image] || data["productImage"] || data[:productImage],
        size: data["size"] || data[:size] || data["selectedSize"] || data[:selectedSize],
        price: (data["price"] || data[:price]).to_f,
        quantity: [ (data["quantity"] || data[:quantity]).to_i, 1 ].max
      }
    end

    def serialize_item(item)
      {
        id: item[:id],
        productId: item[:product_id],
        productName: item[:product_name],
        productImage: item[:product_image],
        size: item[:size],
        price: item[:price],
        quantity: item[:quantity]
      }
    end
  end
end
