module OrderNotifications
  class IOrderSubject
    def attachObserver(_observer)
      raise NotImplementedError, "#{self.class.name} must implement #attachObserver(observer)"
    end

    def detachObserver(_observer)
      raise NotImplementedError, "#{self.class.name} must implement #detachObserver(observer)"
    end

    def notifyObservers
      raise NotImplementedError, "#{self.class.name} must implement #notifyObservers()"
    end

    def addItem(_product, _size, _quantity)
      raise NotImplementedError, "#{self.class.name} must implement #addItem(product, size, quantity)"
    end

    def removeItem(_cart_item_id)
      raise NotImplementedError, "#{self.class.name} must implement #removeItem(cartItemId)"
    end

    def updateQuantity(_cart_item_id, _quantity)
      raise NotImplementedError, "#{self.class.name} must implement #updateQuantity(cartItemId, quantity)"
    end

    def clearCart
      raise NotImplementedError, "#{self.class.name} must implement #clearCart()"
    end
  end
end
