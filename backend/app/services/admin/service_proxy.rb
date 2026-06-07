module Admin
  class ServiceProxy
    def initialize(real_service, token)
      @real_service = real_service
      @token = token
    end

    # Intercept method calls, validate session token, and delegate if authorized.
    def method_missing(method_name, *args, &block)
      if AdminSessionManager.instance.validate_session(@token)
        @real_service.send(method_name, *args, &block)
      else
        raise AccessDeniedError, "Invalid or expired administrator session"
      end
    end

    def respond_to_missing?(method_name, include_private = false)
      @real_service.respond_to?(method_name, include_private) || super
    end
  end
end
