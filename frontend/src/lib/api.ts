import type {
  OrderRecord,
  OrderItemRecord,
  PaymentRecord,
  Customer,
  PaymentMethodType,
} from '../types'

interface RawOrder {
  orderId: number
  customer: Customer
  items: RawOrderItem[]
  payment: RawPayment | null
  status: 'pending' | 'paid' | 'failed' | 'expired'
  finalTotal: number
  paymentMethod:
    | { type: PaymentMethodType; provider?: string | null; bank?: string | null }
    | string
  createdAt: string
  orderPromotions?: {
    code: string
    discountTarget: 'base_price' | 'shipping'
    discountApplied: number | string
  }[]
}

interface RawOrderItem {
  orderItemId: number
  orderId: number
  productId: number | string
  productName?: string
  productImage?: string
  unitPrice: number | string
  quantity: number | string
  subtotal?: number | string
}

interface RawPayment {
  paymentId: number
  orderId: number
  method: PaymentMethodType
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  amount: number | string
  processedAt: string
  transactionId?: string
}

export function normalizeOrder(r: RawOrder): OrderRecord {
  return {
    orderId: r.orderId,
    customer: r.customer,
    items: (r.items || []).map(normalizeOrderItem),
    payment: r.payment ? normalizePayment(r.payment) : null,
    status: r.status,
    finalTotal: Number(r.finalTotal),
    paymentMethod: r.paymentMethod,
    createdAt: r.createdAt,
    orderPromotions: (r.orderPromotions || []).map((p) => ({
      code: p.code,
      discountTarget: p.discountTarget,
      discountApplied: Number(p.discountApplied),
    })),
  }
}

export function normalizeOrders(arr: unknown): OrderRecord[] {
  if (!Array.isArray(arr)) return []
  return (arr as RawOrder[]).map(normalizeOrder)
}

function normalizeOrderItem(i: RawOrderItem): OrderItemRecord {
  return {
    orderItemId: i.orderItemId,
    orderId: i.orderId,
    productId: String(i.productId),
    productName: i.productName || '',
    productImage: i.productImage || '',
    unitPrice: Number(i.unitPrice),
    quantity: Number(i.quantity),
    subtotal: i.subtotal !== undefined ? Number(i.subtotal) : Number(i.unitPrice) * Number(i.quantity),
  }
}

function normalizePayment(p: RawPayment): PaymentRecord {
  return {
    paymentId: p.paymentId,
    orderId: p.orderId,
    method: p.method,
    status: p.status,
    amount: Number(p.amount),
    processedAt: p.processedAt,
    transactionId: p.transactionId,
  }
}
