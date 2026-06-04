import { db } from './db'

export function seed() {
  const now = new Date().toISOString()

  db.product.create({
    id: '1', name: 'Vintage Desk Lamp', slug: 'vintage-desk-lamp',
    description: 'A beautifully crafted vintage-style desk lamp with brass finish and adjustable arm. Perfect for your home office or reading nook.',
    price: 89.90, originalPrice: 129.90, image: '/placeholder.svg', category: 'Lighting',
    rating: 4.5, reviewCount: 128, stock: 25, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '2', name: 'Ceramic Table Vase', slug: 'ceramic-table-vase',
    description: 'Hand-thrown ceramic vase with matte glaze finish. Each piece is unique with its own character.',
    price: 45.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Home',
    rating: 4.8, reviewCount: 64, stock: 15, isNew: true, createdAt: now,
  })
  db.product.create({
    id: '3', name: 'Wireless Bluetooth Earbuds', slug: 'wireless-bluetooth-earbuds',
    description: 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance.',
    price: 199.00, originalPrice: 259.00, image: '/placeholder.svg', category: 'Electronics',
    rating: 4.3, reviewCount: 342, stock: 50, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '4', name: 'Leather Journal Notebook', slug: 'leather-journal-notebook',
    description: 'Handbound leather journal with 200 pages of acid-free paper. Features a wrap closure and ribbon bookmark.',
    price: 38.50, originalPrice: undefined, image: '/placeholder.svg', category: 'Stationery',
    rating: 4.9, reviewCount: 89, stock: 100, isNew: true, createdAt: now,
  })
  db.product.create({
    id: '5', name: 'Minimalist Canvas Watch', slug: 'minimalist-canvas-watch',
    description: 'Clean, minimalist timepiece with canvas strap and Japanese quartz movement. Available in multiple colors.',
    price: 129.00, originalPrice: 169.00, image: '/placeholder.svg', category: 'Accessories',
    rating: 4.6, reviewCount: 215, stock: 30, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '6', name: 'Cast Iron Dutch Oven', slug: 'cast-iron-dutch-oven',
    description: '5.5-quart enameled cast iron dutch oven. Perfect for slow cooking, braising, and baking artisan bread.',
    price: 179.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Kitchen',
    rating: 4.7, reviewCount: 156, stock: 20, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '7', name: 'Pendant Ceiling Light', slug: 'pendant-ceiling-light',
    description: 'Modern pendant light with hand-blown glass shade. Adjustable cord length up to 150cm.',
    price: 145.00, originalPrice: 185.00, image: '/placeholder.svg', category: 'Lighting',
    rating: 4.4, reviewCount: 73, stock: 12, isNew: true, createdAt: now,
  })
  db.product.create({
    id: '8', name: 'Bamboo Cutting Board Set', slug: 'bamboo-cutting-board-set',
    description: 'Set of 3 organic bamboo cutting boards in graduated sizes. Naturally antimicrobial and eco-friendly.',
    price: 42.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Kitchen',
    rating: 4.5, reviewCount: 198, stock: 45, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '9', name: 'Smart LED Strip Lights', slug: 'smart-led-strip-lights',
    description: 'WiFi-enabled LED strip lights with 16 million colors, music sync, and voice control compatibility.',
    price: 59.90, originalPrice: 79.90, image: '/placeholder.svg', category: 'Electronics',
    rating: 4.2, reviewCount: 567, stock: 80, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '10', name: 'Wool Throw Blanket', slug: 'wool-throw-blanket',
    description: 'Luxuriously soft merino wool throw blanket. Ethically sourced and available in earth tones.',
    price: 95.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Home',
    rating: 4.8, reviewCount: 44, stock: 18, isNew: true, createdAt: now,
  })
  db.product.create({
    id: '11', name: 'Brass Bookend Set', slug: 'brass-bookend-set',
    description: 'Solid brass bookends with geometric design. Weighted base keeps your books perfectly organized.',
    price: 55.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Home',
    rating: 4.6, reviewCount: 37, stock: 22, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '12', name: 'Fountain Pen Starter Kit', slug: 'fountain-pen-starter-kit',
    description: 'Complete fountain pen kit with converter, 3 ink cartridges, and a practice notebook. Perfect for beginners.',
    price: 48.00, originalPrice: 65.00, image: '/placeholder.svg', category: 'Stationery',
    rating: 4.4, reviewCount: 112, stock: 60, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '13', name: 'Suede Crossbody Bag', slug: 'suede-crossbody-bag',
    description: 'Premium suede crossbody bag with adjustable strap and multiple compartments. Minimalist design meets everyday practicality.',
    price: 159.00, originalPrice: 199.00, image: '/placeholder.svg', category: 'Accessories',
    rating: 4.7, reviewCount: 89, stock: 14, isNew: true, createdAt: now,
  })
  db.product.create({
    id: '14', name: 'Stainless Steel French Press', slug: 'stainless-steel-french-press',
    description: 'Double-walled stainless steel French press that keeps coffee hot for hours. 1-liter capacity with fine mesh filter.',
    price: 68.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Kitchen',
    rating: 4.5, reviewCount: 234, stock: 35, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '15', name: 'Geometric Table Lamp', slug: 'geometric-table-lamp',
    description: 'Contemporary geometric table lamp with marble base and linen shade. Warm ambient lighting for any room.',
    price: 119.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Lighting',
    rating: 4.3, reviewCount: 56, stock: 10, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '16', name: 'Wireless Charging Pad', slug: 'wireless-charging-pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Slim design with LED indicator.',
    price: 35.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Electronics',
    rating: 4.1, reviewCount: 423, stock: 100, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '17', name: 'Linen Cushion Cover Set', slug: 'linen-cushion-cover-set',
    description: 'Set of 2 linen cushion covers with hidden zipper. Stonewashed for extra softness. 50x50cm each.',
    price: 32.00, originalPrice: 45.00, image: '/placeholder.svg', category: 'Home',
    rating: 4.6, reviewCount: 78, stock: 40, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '18', name: 'Porcelain Tea Set', slug: 'porcelain-tea-set',
    description: 'Traditional porcelain tea set with 6 cups, teapot, and serving tray. Delicate hand-painted floral pattern.',
    price: 88.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Kitchen',
    rating: 4.9, reviewCount: 42, stock: 8, isNew: true, createdAt: now,
  })
  db.product.create({
    id: '19', name: 'Acrylic Paint Set', slug: 'acrylic-paint-set',
    description: 'Professional-grade acrylic paint set with 24 vibrant colors. Includes 3 brushes and a mixing palette.',
    price: 52.00, originalPrice: 68.00, image: '/placeholder.svg', category: 'Stationery',
    rating: 4.7, reviewCount: 167, stock: 55, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '20', name: 'Leather Card Holder', slug: 'leather-card-holder',
    description: 'Slim RFID-blocking leather card holder. Holds up to 6 cards. Minimalist design in full-grain leather.',
    price: 45.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Accessories',
    rating: 4.4, reviewCount: 201, stock: 70, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '21', name: 'LED Desk Lamp', slug: 'led-desk-lamp',
    description: 'Adjustable LED desk lamp with 5 brightness levels and 3 color temperatures. USB charging port built in.',
    price: 79.90, originalPrice: 99.90, image: '/placeholder.svg', category: 'Lighting',
    rating: 4.5, reviewCount: 312, stock: 40, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '22', name: 'Portable Bluetooth Speaker', slug: 'portable-bluetooth-speaker',
    description: 'Waterproof portable Bluetooth speaker with 360-degree sound and 20-hour battery life.',
    price: 149.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Electronics',
    rating: 4.6, reviewCount: 189, stock: 25, isNew: false, createdAt: now,
  })
  db.product.create({
    id: '23', name: 'Washi Tape Collection', slug: 'washi-tape-collection',
    description: 'Set of 15 decorative washi tapes in assorted patterns and colors. Perfect for journaling, crafting, and gift wrapping.',
    price: 22.00, originalPrice: undefined, image: '/placeholder.svg', category: 'Stationery',
    rating: 4.8, reviewCount: 93, stock: 120, isNew: true, createdAt: now,
  })
  db.product.create({
    id: '24', name: 'Wooden Spice Rack', slug: 'wooden-spice-rack',
    description: 'Wall-mounted wooden spice rack with 12 glass jars and labels. Bamboo construction with magnetic closure.',
    price: 38.00, originalPrice: 49.00, image: '/placeholder.svg', category: 'Kitchen',
    rating: 4.3, reviewCount: 145, stock: 30, isNew: false, createdAt: now,
  })

  db.coupon.create({
    id: 'c1', code: 'SAVE20', description: 'Save 20%% on your order',
    discountType: 'percentage', discountValue: 20, minPurchase: 100, maxDiscount: 150,
    expiresAt: '2027-12-31T23:59:59Z', isActive: true, usageLimit: 1000, usageCount: 45,
  })
  db.coupon.create({
    id: 'c2', code: 'FREESHIP', description: 'Free shipping on your order',
    discountType: 'fixed', discountValue: 15, minPurchase: 50,
    expiresAt: '2027-12-31T23:59:59Z', isActive: true, usageLimit: 500, usageCount: 120,
  })
  db.coupon.create({
    id: 'c3', code: 'WELCOME10', description: '10%% off your first purchase',
    discountType: 'percentage', discountValue: 10, maxDiscount: 50,
    expiresAt: '2027-12-31T23:59:59Z', isActive: true, usageLimit: 2000, usageCount: 340,
  })
  db.coupon.create({
    id: 'c4', code: 'BULK30', description: '30%% off for bulk orders',
    discountType: 'percentage', discountValue: 30, minPurchase: 200, maxDiscount: 300,
    expiresAt: '2027-12-31T23:59:59Z', isActive: true, usageLimit: 200, usageCount: 18,
  })
  db.coupon.create({
    id: 'c5', code: 'NEWUSER', description: '15%% off for new users',
    discountType: 'percentage', discountValue: 15, maxDiscount: 75,
    expiresAt: '2027-12-31T23:59:59Z', isActive: true, usageLimit: 3000, usageCount: 560,
  })
  db.coupon.create({
    id: 'c6', code: 'FLASH50', description: 'RM50 off on orders above RM300',
    discountType: 'fixed', discountValue: 50, minPurchase: 300,
    expiresAt: '2027-12-31T23:59:59Z', isActive: true, usageLimit: 100, usageCount: 12,
  })

  db.address.create({
    id: 'a1', fullName: 'Alex Tan', phone: '012-3456789', email: 'alex@example.com',
    address: '12, Jalan Bukit Bintang', city: 'Kuala Lumpur', state: 'WP Kuala Lumpur',
    postcode: '55100', isDefault: true,
  })
  db.address.create({
    id: 'a2', fullName: 'Alex Tan', phone: '016-9876543', email: 'alex@example.com',
    address: '45, Persiaran Gurney', city: 'George Town', state: 'Pulau Pinang',
    postcode: '10250', isDefault: false,
  })

  db.order.create({
    id: 'ORD-001', items: [
      { id: 'oi1', productId: '1', productName: 'Vintage Desk Lamp', productImage: '/placeholder.svg', price: 89.90, quantity: 1 },
      { id: 'oi2', productId: '4', productName: 'Leather Journal Notebook', productImage: '/placeholder.svg', price: 38.50, quantity: 2 },
    ],
    subtotal: 128.40, discount: 0, shipping: 10, total: 138.40,
    paymentMethod: { type: 'ewallet', provider: 'tng' } as const,
    status: 'paid',
    shippingAddress: { id: 'a1', fullName: 'Alex Tan', phone: '012-3456789', email: 'alex@example.com', address: '12, Jalan Bukit Bintang', city: 'Kuala Lumpur', state: 'WP Kuala Lumpur', postcode: '55100', isDefault: true },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  })
  db.order.create({
    id: 'ORD-002', items: [
      { id: 'oi3', productId: '6', productName: 'Cast Iron Dutch Oven', productImage: '/placeholder.svg', price: 179.00, quantity: 1 },
    ],
    subtotal: 179.00, discount: 35.80, shipping: 0, total: 143.20,
    couponCode: 'SAVE20',
    paymentMethod: { type: 'duitnow', subtype: 'qr' } as const,
    status: 'paid',
    shippingAddress: { id: 'a2', fullName: 'Alex Tan', phone: '016-9876543', email: 'alex@example.com', address: '45, Persiaran Gurney', city: 'George Town', state: 'Pulau Pinang', postcode: '10250', isDefault: false },
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  })
  db.order.create({
    id: 'ORD-003', items: [
      { id: 'oi4', productId: '3', productName: 'Wireless Bluetooth Earbuds', productImage: '/placeholder.svg', price: 199.00, quantity: 1 },
      { id: 'oi5', productId: '16', productName: 'Wireless Charging Pad', productImage: '/placeholder.svg', price: 35.00, quantity: 1 },
    ],
    subtotal: 234.00, discount: 0, shipping: 10, total: 244.00,
    paymentMethod: { type: 'card', cardId: undefined } as const,
    status: 'pending',
    shippingAddress: { id: 'a1', fullName: 'Alex Tan', phone: '012-3456789', email: 'alex@example.com', address: '12, Jalan Bukit Bintang', city: 'Kuala Lumpur', state: 'WP Kuala Lumpur', postcode: '55100', isDefault: true },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  })
}
