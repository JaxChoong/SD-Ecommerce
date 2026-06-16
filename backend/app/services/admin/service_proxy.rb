module Admin
  class ServiceProxy
    def initialize(real_service, token)
      @real_service = real_service
      @token = token
    end

    # SOLID Principle: DIP (Dependency Inversion Principle)
    # The ServiceProxy depends on abstraction (Ruby's dynamic method dispatch) to control access
    # to any backend service. It doesn't compile-time couple itself to InventoryService or PromotionService.
    def method_missing(method_name, *args, &block)
      # PROXY PATTERN BREAKPOINT
      # Place debugger here to demonstrate Protection Proxy intercepting service method calls.
      debugger if Rails.env.development?
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
