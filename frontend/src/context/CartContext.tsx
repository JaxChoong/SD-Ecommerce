import { createContext, useContext, useReducer, type ReactNode, useMemo } from 'react'
import type { CartItem, CouponValidation } from '../types'

interface CartState {
  items: CartItem[]
  appliedCoupon: CouponValidation | null
  couponCode: string | null
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: CouponValidation }
  | { type: 'REMOVE_COUPON' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.productId === action.payload.productId)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i,
          ),
        }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i,
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [], appliedCoupon: null, couponCode: null }
    case 'APPLY_COUPON':
      return { ...state, appliedCoupon: action.payload, couponCode: action.payload.isValid ? state.couponCode : null }
    case 'REMOVE_COUPON':
      return { ...state, appliedCoupon: null, couponCode: null }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  appliedCoupon: CouponValidation | null
  couponCode: string | null
  itemCount: number
  subtotal: number
  discount: number
  shipping: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (code: string, validation: CouponValidation) => void
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    appliedCoupon: null,
    couponCode: null,
  })

  const subtotal = useMemo(() => {
    return Math.round(state.items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100
  }, [state.items])

  const discount = useMemo(() => {
    if (state.appliedCoupon?.isValid && state.appliedCoupon.discount) {
      return state.appliedCoupon.discount.appliedAmount
    }
    return 0
  }, [state.appliedCoupon])

  const shipping = useMemo(() => {
    if (subtotal >= 100) return 0
    return subtotal > 0 ? 10 : 0
  }, [subtotal])

  const total = useMemo(() => {
    return Math.round((subtotal - discount + shipping) * 100) / 100
  }, [subtotal, discount, shipping])

  const itemCount = useMemo(() => {
    return state.items.reduce((c, i) => c + i.quantity, 0)
  }, [state.items])

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item })
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })
  const applyCoupon = (code: string, validation: CouponValidation) => {
    dispatch({ type: 'APPLY_COUPON', payload: { ...validation, isValid: validation.isValid } })
    if (validation.isValid) {
      state.couponCode = code
    }
  }
  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' })

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        couponCode: state.couponCode,
        itemCount,
        subtotal,
        discount,
        shipping,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
