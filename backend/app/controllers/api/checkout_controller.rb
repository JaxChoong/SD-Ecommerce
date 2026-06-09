module Api
  class CheckoutController < ApplicationController
    class PaymentFailedError < StandardError; end

    def create
      customer_params = params.require(:customer).permit(:name, :email, :phone, :shoppingAddress)
      items_params = params.require(:items).map do |item|
        item.permit(:productId, :quantity, :unitPrice).to_h
      end
      payment_params = params.require(:paymentMethod).permit(:type, :provider, :bank).to_h
      amount = params[:amount].to_f

      method_type = payment_params["type"].to_s
      provider = payment_params["provider"].presence
      bank = payment_params["bank"].presence

      if amount <= 0
        render json: { success: false, error: "Invalid amount." }, status: :unprocessable_entity
        return
      end

      if items_params.empty?
        render json: { success: false, error: "Cart is empty." }, status: :unprocessable_entity
        return
      end

      unless PaymentStrategy::CheckoutContext::SUPPORTED_METHODS.include?(method_type)
        render json: { success: false, error: "Unsupported payment method: #{method_type}" }, status: :unprocessable_entity
        return
      end

      order = nil
      gateway_result = nil
      payment_error = nil
      begin
        ActiveRecord::Base.transaction do
          customer = Customer.create!(
            name: customer_params[:name],
            email: customer_params[:email],
            phone: customer_params[:phone],
            shoppingAddress: customer_params[:shoppingAddress]
          )

          cart = ShoppingCart.create!(
            customer: customer,
            status: "ordered",
            createdAt: Time.current
          )

          items_params.each do |item|
            product = Product.find_by(productid: item["productId"])
            next unless product
            CartItem.create!(
              cart: cart,
              product: product,
              quantity: item["quantity"].to_i,
              unitPrice: item["unitPrice"].to_f
            )
          end

          order = Order.create!(
            customer: customer,
            createdAt: Time.current,
            finalTotal: amount,
            status: "pending",
            paymentMethod: method_type
          )

          items_params.each do |item|
            product = Product.find_by(productid: item["productId"])
            next unless product
            OrderItem.create!(
              order: order,
              product: product,
              quantity: item["quantity"].to_i,
              unitPrice: item["unitPrice"].to_f
            )
          end

          strategy = PaymentStrategy::CheckoutContext.build_strategy(method_type)
          context = PaymentStrategy::CheckoutContext.new
          context.set_payment_method(strategy)
          gateway_result = context.execute_checkout(amount)

          unless gateway_result[:success]
            payment_error = gateway_result[:error] || "Payment failed"
            raise PaymentFailedError, payment_error
          end

          Payment.create!(
            order: order,
            method: method_type,
            status: "paid",
            amount: amount,
            processedAt: Time.current,
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
        type: method_type,
        provider: provider,
        bank: bank
      }
      render json: response_payload, status: :created
    end
  end
end
