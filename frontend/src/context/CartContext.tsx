import { createContext, useContext, useEffect, useReducer, type ReactNode, useMemo } from 'react'
import type { CartItem, CouponValidation } from '../types'
import { useToast } from '../components/ui/toast'

const CART_STORAGE_KEY = 'ezshop_cart'
const CART_STORAGE_TTL_MS = 24 * 60 * 60 * 1000

interface CartState {
  items: CartItem[]
  appliedCoupon: CouponValidation | null
  appliedCoupons: CouponValidation[]
  couponCode: string | null
  couponCodes: string[]
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
  | { type: 'REMOVE_COUPON'; payload?: string }

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
      return { ...state, items: [], appliedCoupon: null, appliedCoupons: [], couponCode: null, couponCodes: [] }
    case 'REPLACE_CART':
      return action.payload
    case 'APPLY_COUPON': {
      const code = action.payload.code.toUpperCase()
      const validation = { ...action.payload.validation, code }
      const newCodes = state.couponCodes.includes(code)
        ? state.couponCodes
        : [...state.couponCodes, code]
      const newCoupons = state.appliedCoupons.some((c) => c.code?.toUpperCase() === code)
        ? state.appliedCoupons.map((c) => c.code?.toUpperCase() === code ? validation : c)
        : [...state.appliedCoupons, validation]
      return {
        ...state,
        appliedCoupon: validation,
        appliedCoupons: newCoupons,
        couponCode: newCodes.join(', '),
        couponCodes: newCodes,
      }
    }
    case 'REMOVE_COUPON': {
      const codeToRemove = action.payload?.toUpperCase()
      if (codeToRemove) {
        const newCodes = state.couponCodes.filter((c) => c.toUpperCase() !== codeToRemove)
        const newCoupons = state.appliedCoupons.filter((c) => c.code?.toUpperCase() !== codeToRemove)
        return {
          ...state,
          appliedCoupon: newCoupons.length > 0 ? newCoupons[newCoupons.length - 1] : null,
          appliedCoupons: newCoupons,
          couponCode: newCodes.length > 0 ? newCodes.join(', ') : null,
          couponCodes: newCodes,
        }
      }
      return { ...state, appliedCoupon: null, appliedCoupons: [], couponCode: null, couponCodes: [] }
    }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  appliedCoupon: CouponValidation | null
  appliedCoupons: CouponValidation[]
  couponCode: string | null
  couponCodes: string[]
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
  removeCoupon: (code?: string) => void
}

const CartContext = createContext<CartContextType | null>(null)

function loadStoredCart(): CartState {
  const emptyCart = { items: [], appliedCoupon: null, appliedCoupons: [], couponCode: null, couponCodes: [] }
  if (typeof window === 'undefined') return emptyCart

  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!saved) return emptyCart

    const parsed = JSON.parse(saved) as Partial<StoredCartState>
    if (!parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(CART_STORAGE_KEY)
      return emptyCart
    }

    const couponCodes = parsed.couponCodes ?? (parsed.couponCode ? [parsed.couponCode] : [])
    const rawAppliedCoupons = parsed.appliedCoupons ?? (parsed.appliedCoupon ? [parsed.appliedCoupon] : [])
    const appliedCoupons = rawAppliedCoupons.map((coupon, index) => ({
      ...coupon,
      code: coupon.code ?? couponCodes[index],
    }))

    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      appliedCoupon: parsed.appliedCoupon ?? (appliedCoupons.length > 0 ? appliedCoupons[appliedCoupons.length - 1] : null),
      appliedCoupons,
      couponCode: couponCodes.length > 0 ? couponCodes.join(', ') : null,
      couponCodes,
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
    if (state.items.length === 0 && state.appliedCoupons.length === 0 && state.couponCodes.length === 0) {
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


  const baseShipping = useMemo(() => {
    if (subtotal >= 100) return 0
    return subtotal > 0 ? 10 : 0
  }, [subtotal])

  const shippingDiscount = useMemo(() => {
    let totalShippingDisc = 0
    state.appliedCoupons.forEach((c) => {
      if (c.isValid && c.discount?.target === 'shipping') {
        const remaining = Math.max(0, baseShipping - totalShippingDisc)
        if (c.discount.type === 'percentage') {
          totalShippingDisc += (baseShipping * c.discount.value) / 100
        } else {
          totalShippingDisc += Math.min(remaining, c.discount.value)
        }
      }
    })
    return Math.min(baseShipping, totalShippingDisc)
  }, [baseShipping, state.appliedCoupons])

  const discount = useMemo(() => {
    return state.appliedCoupons
      .filter((c) => c.isValid && c.discount?.target !== 'shipping')
      .reduce((sum, c) => sum + (c.discount?.appliedAmount || 0), 0)
  }, [state.appliedCoupons])

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
    const couponCodes = cart.couponCodes ?? (cart.couponCode ? [cart.couponCode] : [])
    const rawAppliedCoupons = cart.appliedCoupons ?? (cart.appliedCoupon ? [cart.appliedCoupon] : [])
    const appliedCoupons = rawAppliedCoupons.map((coupon, index) => ({
      ...coupon,
      code: coupon.code ?? couponCodes[index],
    }))

    dispatch({
      type: 'REPLACE_CART',
      payload: {
        items: cart.items,
        appliedCoupon: cart.appliedCoupon ?? (appliedCoupons.length > 0 ? appliedCoupons[appliedCoupons.length - 1] : null),
        appliedCoupons,
        couponCode: couponCodes.length > 0 ? couponCodes.join(', ') : null,
        couponCodes,
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
      couponCodes: state.couponCodes,
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
  const removeCoupon = (code?: string) => dispatch({ type: 'REMOVE_COUPON', payload: code })

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        appliedCoupons: state.appliedCoupons,
        couponCode: state.couponCode,
        couponCodes: state.couponCodes,
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
