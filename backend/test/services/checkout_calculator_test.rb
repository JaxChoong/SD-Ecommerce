require "test_helper"

class CheckoutCalculatorTest < ActiveSupport::TestCase
  setup do
    # Clear tables to avoid conflicts
    Product.destroy_all
    Promotion.destroy_all

    # Create temp products for testing
    @shirt = Product.create!(
      name: "Test Shirt",
      category: "Shirts",
      basePrice: 50.0,
      size: "M",
      stockQuantity: 10
    )
    @shoes = Product.create!(
      name: "Test Shoes",
      category: "Shoes",
      basePrice: 200.0,
      size: "10",
      stockQuantity: 5
    )
  end

  test "percentage discount on all products" do
    coupon = Promotion.create!(
      promoCode: "PCTSTOREWIDE",
      name: "20% off storewide",
      type: "percentage",
      discountValue: 20.0,
      category: "all",
      discountTarget: "base_price",
      startDate: Time.current - 1.day,
      endDate: Time.current + 1.day,
      usageCount: 0
    )

    items = [
      { product: @shirt, price: 50.0, quantity: 2 }, # 100.0
      { product: @shoes, price: 200.0, quantity: 1 }  # 200.0
    ]

    checkout = Promotions::Checkout.new(
      items: items,
      subtotal: 300.0,
      shipping: 0.0,
      coupon: coupon
    )

    result = checkout.calculate

    assert_equal 60.0, result[:discount] # 20% of 300
    assert_equal 0.0, result[:shipping_discount]
    assert_equal 240.0, result[:total]
  end

  test "percentage discount restricted by category" do
    coupon = Promotion.create!(
      promoCode: "PCTSHOES",
      name: "10% off Shoes only",
      type: "percentage",
      discountValue: 10.0,
      category: "Shoes",
      discountTarget: "base_price",
      startDate: Time.current - 1.day,
      endDate: Time.current + 1.day,
      usageCount: 0
    )

    items = [
      { product: @shirt, price: 50.0, quantity: 2 }, # 100.0 (non-applicable)
      { product: @shoes, price: 200.0, quantity: 1 }  # 200.0 (applicable)
    ]

    checkout = Promotions::Checkout.new(
      items: items,
      subtotal: 300.0,
      shipping: 0.0,
      coupon: coupon
    )

    result = checkout.calculate

    assert_equal 20.0, result[:discount] # 10% of 200.0
    assert_equal 280.0, result[:total]
  end

  test "fixed discount on all products" do
    coupon = Promotion.create!(
      promoCode: "FIXSTOREWIDE",
      name: "RM30 off storewide",
      type: "fixed",
      discountValue: 30.0,
      category: "all",
      discountTarget: "base_price",
      startDate: Time.current - 1.day,
      endDate: Time.current + 1.day,
      usageCount: 0
    )

    items = [
      { product: @shirt, price: 50.0, quantity: 1 }
    ]

    checkout = Promotions::Checkout.new(
      items: items,
      subtotal: 50.0,
      shipping: 10.0,
      coupon: coupon
    )

    result = checkout.calculate

    assert_equal 30.0, result[:discount]
    assert_equal 30.0, result[:total] # 50 - 30 + 10 = 30
  end

  test "fixed discount restricted by category capped by subtotal" do
    coupon = Promotion.create!(
      promoCode: "FIXDRESS",
      name: "RM100 off Dresses",
      type: "fixed",
      discountValue: 100.0,
      category: "Dresses", # None in items
      discountTarget: "base_price",
      startDate: Time.current - 1.day,
      endDate: Time.current + 1.day,
      usageCount: 0
    )

    items = [
      { product: @shirt, price: 50.0, quantity: 1 }
    ]

    checkout = Promotions::Checkout.new(
      items: items,
      subtotal: 50.0,
      shipping: 10.0,
      coupon: coupon
    )

    result = checkout.calculate

    assert_equal 0.0, result[:discount]
    assert_equal 60.0, result[:total]
  end

  test "fixed shipping discount" do
    coupon = Promotion.create!(
      promoCode: "FREESHIP",
      name: "RM15 off Shipping",
      type: "fixed",
      discountValue: 15.0,
      category: "all",
      discountTarget: "shipping",
      startDate: Time.current - 1.day,
      endDate: Time.current + 1.day,
      usageCount: 0
    )

    items = [
      { product: @shirt, price: 50.0, quantity: 1 }
    ]

    checkout = Promotions::Checkout.new(
      items: items,
      subtotal: 50.0,
      shipping: 10.0, # base shipping
      coupon: coupon
    )

    result = checkout.calculate

    assert_equal 0.0, result[:discount]
    assert_equal 10.0, result[:shipping_discount] # capped at base shipping
    assert_equal 50.0, result[:total] # 50 - 0 + (10 - 10) = 50
  end
end
