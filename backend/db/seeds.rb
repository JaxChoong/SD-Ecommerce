# Clear existing data to ensure idempotency
puts "Clearing existing database records..."
Promotion.destroy_all
Product.destroy_all
Administrator.destroy_all

puts "Seeding Administrators..."
Administrator.create!(
  username: 'admin',
  password: 'adminpassword'
)

puts "Seeding Products..."
products_data = [
  # Shirts
  {
    name: "Classic Oxford Cotton Shirt",
    category: "Shirts",
    description: "A timeless classic Oxford shirt made from 100% premium cotton. Features a button-down collar and a tailored fit.",
    basePrice: 129.00,
    size: { "XS" => 10, "S" => 20, "M" => 30, "L" => 25, "XL" => 15, "XXL" => 5, "One Size" => 0 }.to_json,
    stockQuantity: 105,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&h=500&fit=crop"
  },
  {
    name: "Minimalist Crewneck Tee",
    category: "Shirts",
    description: "Ultra-soft combed cotton tee with a relaxed fit. Pre-shrunk and double-stitched for longevity.",
    basePrice: 49.00,
    size: { "XS" => 15, "S" => 30, "M" => 40, "L" => 35, "XL" => 20, "XXL" => 10, "One Size" => 0 }.to_json,
    stockQuantity: 150,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&h=500&fit=crop"
  },
  # Pants
  {
    name: "Slim Fit Stretch Chinos",
    category: "Pants",
    description: "Comfortable slim-fit chinos crafted from stretch twill cotton. Perfect for smart-casual wear.",
    basePrice: 159.00,
    size: { "XS" => 5, "S" => 15, "M" => 25, "L" => 20, "XL" => 10, "XXL" => 5, "One Size" => 0 }.to_json,
    stockQuantity: 80,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop"
  },
  {
    name: "Raw Denim Jeans",
    category: "Pants",
    description: "Classic straight-cut jeans made from heavy 14oz raw selvedge denim. Designed to break in beautifully.",
    basePrice: 199.00,
    size: { "XS" => 5, "S" => 10, "M" => 20, "L" => 15, "XL" => 10, "XXL" => 5, "One Size" => 0 }.to_json,
    stockQuantity: 65,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop"
  },
  # Shoes
  {
    name: "Minimalist Leather Sneakers",
    category: "Shoes",
    description: "Clean, low-top sneakers handcrafted from full-grain calfskin leather. Features a durable Margom rubber sole.",
    basePrice: 329.00,
    size: { "39" => 5, "40" => 10, "41" => 15, "42" => 20, "43" => 15, "44" => 10, "45" => 5 }.to_json,
    stockQuantity: 80,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"
  },
  {
    name: "Premium Suede Chelsea Boots",
    category: "Shoes",
    description: "Elegant Chelsea boots in sand-colored Italian suede. Features elasticated side panels and a pull tab.",
    basePrice: 450.00,
    size: { "39" => 3, "40" => 7, "41" => 12, "42" => 15, "43" => 12, "44" => 8, "45" => 3 }.to_json,
    stockQuantity: 60,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"
  },
  # Jackets
  {
    name: "Leather Bomber Jacket",
    category: "Jackets",
    description: "Heavyweight genuine lambskin leather bomber jacket with ribbed cuffs, collar, and hem.",
    basePrice: 599.00,
    size: { "XS" => 2, "S" => 5, "M" => 10, "L" => 8, "XL" => 5, "XXL" => 2, "One Size" => 0 }.to_json,
    stockQuantity: 32,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop"
  },
  {
    name: "Waterproof Windbreaker",
    category: "Jackets",
    description: "Lightweight, packable windbreaker made from breathable ripstop fabric. DWR coated to repel water.",
    basePrice: 189.00,
    size: { "XS" => 5, "S" => 10, "M" => 15, "L" => 15, "XL" => 10, "XXL" => 5, "One Size" => 0 }.to_json,
    stockQuantity: 60,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop"
  },
  # Accessories
  {
    name: "Full-Grain Leather Belt",
    category: "Accessories",
    description: "Classic belt constructed from solid vegetable-tanned steerhide leather. Features a solid brass buckle.",
    basePrice: 89.00,
    size: { "XS" => 0, "S" => 0, "M" => 0, "L" => 0, "XL" => 0, "XXL" => 0, "One Size" => 50 }.to_json,
    stockQuantity: 50,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop"
  },
  # Dresses
  {
    name: "Linen Summer Wrap Dress",
    category: "Dresses",
    description: "Light and airy wrap dress woven from 100% Belgian linen. Features an adjustable waist tie and side pockets.",
    basePrice: 219.00,
    size: { "XS" => 4, "S" => 8, "M" => 12, "L" => 10, "XL" => 6, "XXL" => 2, "One Size" => 0 }.to_json,
    stockQuantity: 42,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop"
  }
]

products_data.each do |p_data|
  Product.create!(p_data)
end

puts "Seeding Promotions..."
now = Time.current

promotions_data = [
  {
    promoCode: "SAVE20",
    name: "Save 20% Storewide",
    type: "percentage",
    discountValue: 20.00,
    category: "all",
    startDate: now - 1.day,
    endDate: now + 30.days,
    IsActive: true,
    usageLimit: 500,
    usageCount: 42
  },
  {
    promoCode: "SHOES15",
    name: "15% Off Shoes",
    type: "percentage",
    discountValue: 15.00,
    category: "Shoes",
    startDate: now - 1.day,
    endDate: now + 14.days,
    IsActive: true,
    usageLimit: 100,
    usageCount: 18
  },
  {
    promoCode: "FREESHIP",
    name: "RM15 Off Shipping",
    type: "fixed",
    discountValue: 15.00,
    category: "all",
    startDate: now - 5.days,
    endDate: now + 90.days,
    IsActive: true,
    usageLimit: nil,
    usageCount: 212
  },
  {
    promoCode: "FLASH50",
    name: "RM50 Off Orders above RM300",
    type: "fixed",
    discountValue: 50.00,
    category: "all",
    startDate: now - 10.days,
    endDate: now - 1.day, # Expired promotion
    IsActive: true,
    usageLimit: 50,
    usageCount: 50
  },
  {
    promoCode: "DRESS30",
    name: "30% Off Dresses Campaign",
    type: "percentage",
    discountValue: 30.00,
    category: "Dresses",
    startDate: now - 1.day,
    endDate: now + 7.days,
    IsActive: false, # Inactive promotion
    usageLimit: 200,
    usageCount: 0
  }
]

promotions_data.each do |promo_data|
  Promotion.create!(promo_data)
end

puts "Database seeded successfully!"
