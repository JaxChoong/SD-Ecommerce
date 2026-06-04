export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  isDefault: boolean;
}

export type PaymentMethod =
  | { type: 'ewallet'; provider: 'tng' | 'grabpay' | 'boost' | 'shopeepay' }
  | { type: 'duitnow'; subtype: 'qr' | 'online' }
  | { type: 'card'; cardId?: string };

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  shippingAddress: Address;
  createdAt: string;
}

export interface CouponValidation {
  isValid: boolean;
  errors?: {
    code: 'EXPIRED' | 'MIN_PURCHASE' | 'MAX_USES' | 'NOT_FOUND' | 'NOT_APPLICABLE';
    message: string;
    requirement?: number;
  };
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    appliedAmount: number;
  };
}

export interface CheckoutForm {
  shipping: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
  };
  payment: PaymentMethod;
  couponCode?: string;
}
