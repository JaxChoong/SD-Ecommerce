module OrderNotifications
  class IOrderObserver
    def update(_orderProcessor)
      raise NotImplementedError, "#{self.class.name} must implement #update(orderProcessor)"
    end
  end
end
