module Api
  class CheckoutController < ApplicationController
    def create
      amount = params[:amount].to_f
      method = params[:method].to_s
      provider = params[:provider].presence
      bank = params[:bank].presence

      if amount <= 0
        render json: { success: false, error: "Invalid amount." }, status: :unprocessable_entity
        return
      end

      unless Payment::CheckoutContext::SUPPORTED_METHODS.include?(method)
        render json: { success: false, error: "Unsupported payment method: #{method}" }, status: :unprocessable_entity
        return
      end

      strategy = Payment::CheckoutContext.build_strategy(method)
      context = Payment::CheckoutContext.new
      context.set_payment_method(strategy)
      result = context.execute_checkout(amount)

      if result[:success]
        result[:provider] = provider if provider
        result[:bank]     = bank if bank
        render json: result, status: :ok
      else
        render json: result, status: :unprocessable_entity
      end
    end
  end
end
