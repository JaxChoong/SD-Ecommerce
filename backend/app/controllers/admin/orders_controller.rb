module Admin
  class OrdersController < BaseController
    before_action :set_proxy

    # GET /admin/orders
    def index
      orders = @proxy.list_orders
      render json: orders.map { |o| serialize_order(o) }
    end

    # GET /admin/orders/:id
    def show
      order = @proxy.get_order(params[:id])
      render json: serialize_order(order, detailed: true)
    end

    private

    def set_proxy
      @proxy = build_proxy(Admin::OrdersService.new)
    end

    def serialize_order(order, detailed: false)
      {
        orderId: order.orderid,
        customer: order.customer&.serialize_for_api,
        items: order.order_items.includes(:product).map(&:serialize_for_api),
        payment: order.payment&.serialize_for_api,
        status: order.status,
        finalTotal: order.finalTotal.to_f,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt&.iso8601,
        orderPromotions: order.order_promotions.includes(:promotion).map do |op|
          {
            code: op.promotion&.promoCode,
            discountTarget: op.promotion&.discountTarget,
            discountApplied: op.discountApplied.to_f
          }
        end
      }
    end
  end
end
