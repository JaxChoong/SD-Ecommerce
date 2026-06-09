import { createContext, useContext, useEffect, useReducer, type ReactNode, useMemo } from 'react'
import type { CartItem, CouponValidation } from '../types'
import { useToast } from '../components/ui/toast'

const CART_STORAGE_KEY = 'ezshop_cart'
const CART_STORAGE_TTL_MS = 24 * 60 * 60 * 1000

interface CartState {
  items: CartItem[]
  appliedCoupon: CouponValidation | null
  couponCode: string | null
}

interface StoredCartState extends CartState {
  expiresAt: number
}

interface ServerCartResponse extends CartState {
  subtotal: number
  discount: number
  shippingDiscount: number
  shipping: number
  total: number
  notificationMessage?: string | null
  stockWarnings?: string[]
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'REPLACE_CART'; payload: CartState }
  | { type: 'APPLY_COUPON'; payload: { code: string; validation: CouponValidation } }
  | { type: 'REMOVE_COUPON' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.productId === action.payload.productId && i.productName === action.payload.productName)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.payload.productId && i.productName === action.payload.productName
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
    case 'REPLACE_CART':
      return action.payload
    case 'APPLY_COUPON':
      return {
        ...state,
        appliedCoupon: action.payload.validation,
        couponCode: action.payload.validation.isValid ? action.payload.code : null,
      }
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
  shippingDiscount: number
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

function loadStoredCart(): CartState {
  const emptyCart = { items: [], appliedCoupon: null, couponCode: null }
  if (typeof window === 'undefined') return emptyCart

  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!saved) return emptyCart

    const parsed = JSON.parse(saved) as Partial<StoredCartState>
    if (!parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(CART_STORAGE_KEY)
      return emptyCart
    }

    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      appliedCoupon: parsed.appliedCoupon ?? null,
      couponCode: parsed.couponCode ?? null,
    }
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY)
    return emptyCart
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadStoredCart)
  const { addToast } = useToast()

  useEffect(() => {
    if (state.items.length === 0 && !state.appliedCoupon && !state.couponCode) {
      window.localStorage.removeItem(CART_STORAGE_KEY)
      return
    }

    const cartToStore: StoredCartState = {
      ...state,
      expiresAt: Date.now() + CART_STORAGE_TTL_MS,
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToStore))
  }, [state])

  const subtotal = useMemo(() => {
    return Math.round(state.items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100
  }, [state.items])

  const isFreeShippingCoupon = useMemo(() => {
    return !!(state.appliedCoupon?.isValid && state.appliedCoupon.discount?.target === 'shipping')
  }, [state.appliedCoupon])

  const baseShipping = useMemo(() => {
    if (subtotal >= 100) return 0
    return subtotal > 0 ? 10 : 0
  }, [subtotal])

  const shippingDiscount = useMemo(() => {
    if (isFreeShippingCoupon && state.appliedCoupon?.isValid && state.appliedCoupon.discount) {
      return Math.min(baseShipping, state.appliedCoupon.discount.value)
    }
    return 0
  }, [baseShipping, isFreeShippingCoupon, state.appliedCoupon])

  const discount = useMemo(() => {
    if (isFreeShippingCoupon) return 0
    if (state.appliedCoupon?.isValid && state.appliedCoupon.discount) {
      return state.appliedCoupon.discount.appliedAmount
    }
    return 0
  }, [state.appliedCoupon, isFreeShippingCoupon])

  const shipping = useMemo(() => {
    return baseShipping - shippingDiscount
  }, [baseShipping, shippingDiscount])

  const total = useMemo(() => {
    return Math.round((subtotal - discount + shipping) * 100) / 100
  }, [subtotal, discount, shipping])

  const itemCount = useMemo(() => {
    return state.items.reduce((c, i) => c + i.quantity, 0)
  }, [state.items])

  const applyServerCart = (cart: ServerCartResponse) => {
    dispatch({
      type: 'REPLACE_CART',
      payload: {
        items: cart.items,
        appliedCoupon: cart.appliedCoupon ?? null,
        couponCode: cart.couponCode ?? null,
      },
    })

    if (cart.notificationMessage) {
      addToast(cart.notificationMessage, cart.stockWarnings?.join(' '), 'success')
    }
  }

  const cartPayload = () => ({
    cart: {
      items: state.items,
      couponCode: state.couponCode,
    },
  })

  const syncCartMutation = async (path: string, options: RequestInit) => {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new Error(errorBody.error || 'Cart could not be updated.')
    }

    return response.json() as Promise<ServerCartResponse>
  }

  const addItem = async (item: CartItem) => {
    try {
      const cart = await syncCartMutation('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          ...cartPayload(),
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        }),
      })
      applyServerCart(cart)
    } catch (error) {
      addToast('Cart update failed', error instanceof Error ? error.message : undefined, 'error')
    }
  }

  const removeItem = async (id: string) => {
    try {
      const cart = await syncCartMutation(`/api/cart/items/${id}`, {
        method: 'DELETE',
        body: JSON.stringify(cartPayload()),
      })
      applyServerCart(cart)
    } catch (error) {
      addToast('Cart update failed', error instanceof Error ? error.message : undefined, 'error')
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const cart = await syncCartMutation(`/api/cart/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...cartPayload(),
          quantity,
        }),
      })
      applyServerCart(cart)
    } catch (error) {
      addToast('Cart update failed', error instanceof Error ? error.message : undefined, 'error')
    }
  }

  const clearCart = async () => {
    try {
      const cart = await syncCartMutation('/api/cart', {
        method: 'DELETE',
        body: JSON.stringify(cartPayload()),
      })
      applyServerCart(cart)
    } catch (error) {
      addToast('Cart update failed', error instanceof Error ? error.message : undefined, 'error')
    }
  }
  const applyCoupon = (code: string, validation: CouponValidation) => {
    dispatch({ type: 'APPLY_COUPON', payload: { code, validation } })
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
        shippingDiscount,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
