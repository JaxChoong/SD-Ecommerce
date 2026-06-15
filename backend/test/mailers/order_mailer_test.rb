require "test_helper"

class OrderMailerTest < ActionMailer::TestCase
  test "receipt email generates correct content" do
    # Create test data
    customer = Customer.create!(
      name: "John Doe",
      email: "john@example.com",
      phone: "012-3456789",
      shoppingAddress: "123 Test Street, Kuala Lumpur"
    )

    product1 = Product.create!(
      name: "Premium Denim Shirt",
      category: "Shirts",
      size: "M",
      basePrice: 49.90,
      stockQuantity: 10,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&h=500&fit=crop"
    )

    product2 = Product.create!(
      name: "Slim Fit Jeans",
      category: "Pants",
      size: "32",
      basePrice: 79.90,
      stockQuantity: 5,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop"
    )

    order = Order.create!(
      customer: customer,
      createdAt: Time.current,
      finalTotal: 129.80,
      status: "paid",
      paymentMethod: "credit_card"
    )

    OrderItem.create!(
      order: order,
      product: product1,
      quantity: 1,
      unitPrice: 49.90,
      size: "M"
    )

    OrderItem.create!(
      order: order,
      product: product2,
      quantity: 1,
      unitPrice: 79.90,
      size: "32"
    )

    # Trigger mailer
    email = OrderMailer.receipt(order)

    # Assert email is sent/generated correctly
    assert_emails 1 do
      email.deliver_now
    end

    assert_equal ["john@example.com"], email.to
    assert_equal ["choongjiaxuen@gmail.com"], email.from
    assert_match "Your EZ-Shop Order Receipt - Order ##{order.orderid}", email.subject

    # Assert body content
    assert_match "John Doe", email.html_part.body.to_s
    assert_match "Premium Denim Shirt", email.html_part.body.to_s
    assert_match "Slim Fit Jeans", email.html_part.body.to_s
    assert_match "129.80", email.html_part.body.to_s

    assert_match "John Doe", email.text_part.body.to_s
    assert_match "Premium Denim Shirt", email.text_part.body.to_s
    assert_match "Slim Fit Jeans", email.text_part.body.to_s
    assert_match "129.80", email.text_part.body.to_s
  end
end
