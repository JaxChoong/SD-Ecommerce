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
  size?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size?: string;
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
  discountTarget: 'base_price' | 'shipping';
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
  | { type: 'card'; cardId?: string }
  | { type: 'credit_card' }
  | { type: 'online_banking'; bank: OnlineBank };

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
  code?: string;
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
    target: 'base_price' | 'shipping';
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

export interface Customer {
  name: string;
  email: string;
  phone: string;
  shoppingAddress: string;
}

export type PaymentMethodType = 'ewallet' | 'credit_card' | 'online_banking' | 'duitnow' | 'card';

export type EwalletProvider = 'tng' | 'grabpay' | 'boost' | 'shopeepay';

export type OnlineBank =
  | 'maybank'
  | 'cimb'
  | 'public_bank'
  | 'rhb'
  | 'hong_leong'
  | 'ambank'
  | 'bank_rakyat'
  | 'bsn';

export interface CardFormValues {
  number: string;
  holder: string;
  expiry: string;
  cvc?: string;
}

export interface OrderItemRecord {
  orderItemId: number;
  orderId: number;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  size?: string;
}

export interface PaymentRecord {
  paymentId: number;
  orderId: number;
  method: PaymentMethodType;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  processedAt: string;
  transactionId?: string;
}

export interface OrderRecord {
  orderId: number;
  customer: Customer;
  items: OrderItemRecord[];
  payment: PaymentRecord | null;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  finalTotal: number;
  paymentMethod: string | PaymentMethod | { type: PaymentMethodType; provider?: string | null; bank?: string | null };
  createdAt: string;
  orderPromotions?: {
    code: string;
    discountTarget: 'base_price' | 'shipping';
    discountApplied: number;
  }[];
}
