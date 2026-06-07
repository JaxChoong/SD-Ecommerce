module Admin
  class BaseController < ApplicationController
    rescue_from Admin::AccessDeniedError, with: :handle_access_denied
    rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid

    protected

    # Extract session token from Authorization: Bearer <token>
    def token_from_header
      token = request.headers["Authorization"]&.split(" ")&.last
      Rails.logger.info "--- DEBUG AUTH ---"
      Rails.logger.info "Header Token: #{token.inspect}"
      Rails.logger.info "Active Token: #{AdminSessionManager.instance.active_token.inspect}"
      Rails.logger.info "Expired?: #{AdminSessionManager.instance.expires_at ? Time.current > AdminSessionManager.instance.expires_at : 'no session'}"
      Rails.logger.info "------------------"
      token
    end

    # Return a protective proxy instance for the given service
    def build_proxy(real_service)
      Admin::ServiceProxy.new(real_service, token_from_header)
    end

    private

    def handle_access_denied(exception)
      render json: { error: exception.message }, status: :unauthorized
    end

    def handle_not_found(exception)
      render json: { error: "Resource not found" }, status: :not_found
    end

    def handle_record_invalid(exception)
      render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
