class CartsController < ApplicationController
  def show
    cart = build_cart
    cart.notifyObservers

    render json: cart.to_h
  end

  def add_item
    product = Product.find_by(productid: params[:product_id] || params[:productId])
    return render json: { error: "Product not found" }, status: :not_found unless product

    cart = build_cart
    cart.addItem(product, params[:size] || params[:selectedSize], params[:quantity])

    render json: cart.to_h
  end

  def remove_item
    cart = build_cart
    cart.removeItem(params[:id])

    render json: cart.to_h
  end

  def update_quantity
    cart = build_cart
    cart.updateQuantity(params[:id], params[:quantity])

    render json: cart.to_h
  end

  def clear
    cart = build_cart
    cart.clearCart

    render json: cart.to_h
  end

  private

  def build_cart
    cart = OrderNotifications::OrderProcessor.new(
      items: params[:items] || params.dig(:cart, :items) || [],
      coupon_code: params[:coupon_code] || params[:couponCode] || params.dig(:cart, :couponCode)
    )

    # OBSERVER PATTERN IMPLEMENTATION:
    # Keep the exact assignment names: attachObserver() registers
    # NotificationService as the observer for cart changes.
    cart.attachObserver(OrderNotifications::NotificationService.new)
    cart
  end
end
