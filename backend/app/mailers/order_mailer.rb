class OrderMailer < ApplicationMailer
  def receipt(order)
    @order = order
    @customer = order.customer
    @order_items = order.order_items.includes(:product)
    @order_promotions = order.order_promotions.includes(:promotion)

    mail(
      to: @customer.email,
      subject: "Your EZ-Shop Order Receipt - Order ##{@order.orderid}"
    )
  end
end
