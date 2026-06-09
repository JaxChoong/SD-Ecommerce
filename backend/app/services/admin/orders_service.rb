module Admin
  class OrdersService
    def list_orders
      Order.includes(:customer, :payment, :order_items).order(createdAt: :desc)
    end

    def get_order(orderid)
      Order.includes(:customer, :payment, :order_items, :order_items => :product).find(orderid)
    end
  end
end
