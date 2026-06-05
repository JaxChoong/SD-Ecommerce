import { http, HttpResponse, delay } from 'msw'
import { db } from './db'

const sleep = (ms = 200) => delay(ms)

export const handlers = [

  http.get('/api/cart', async () => {
    await sleep()
    return HttpResponse.json(db.cartItem.getAll())
  }),

  http.post('/api/cart/items', async ({ request }) => {
    await sleep()
    const body = (await request.json()) as { productId: string; productName: string; productImage: string; price: number; quantity: number }
    const existing = db.cartItem.findFirst({
      where: { productId: { equals: body.productId } },
    })
    if (existing) {
      const updated = db.cartItem.update({
        where: { id: { equals: existing.id } },
        data: { quantity: existing.quantity + (body.quantity || 1) },
      })
      return HttpResponse.json(updated)
    }
    const item = db.cartItem.create({
      id: crypto.randomUUID(),
      productId: body.productId,
      productName: body.productName,
      productImage: body.productImage,
      price: body.price,
      quantity: body.quantity || 1,
    })
    return HttpResponse.json(item, { status: 201 })
  }),

  http.patch('/api/cart/items/:itemId', async ({ params, request }) => {
    await sleep()
    const body = (await request.json()) as { quantity: number }
    const item = db.cartItem.update({
      where: { id: { equals: params.itemId as string } },
      data: { quantity: body.quantity },
    })
    if (!item) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(item)
  }),

  http.delete('/api/cart/items/:itemId', async ({ params }) => {
    await sleep()
    db.cartItem.delete({ where: { id: { equals: params.itemId as string } } })
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete('/api/cart', async () => {
    await sleep()
    db.cartItem.getAll().forEach((item) => {
      db.cartItem.delete({ where: { id: { equals: item.id } } })
    })
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/coupons', async ({ request }) => {
    await sleep()
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    let coupons = db.coupon.getAll()
    if (search) {
      const q = search.toLowerCase()
      coupons = coupons.filter(
        (c) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
      )
    }
    return HttpResponse.json(coupons)
  }),

  http.post('/api/coupons/validate', async ({ request }) => {
    await sleep()
    const body = (await request.json()) as { code: string; cartTotal: number }
    const code = body.code.toUpperCase()
    const cartTotal = body.cartTotal

    const coupon = db.coupon.findFirst({
      where: { code: { equals: code } },
    })

    if (!coupon) {
      return HttpResponse.json({
        isValid: false,
        errors: { code: 'NOT_FOUND', message: `Coupon "${code}" not found.` },
      })
    }

    if (!coupon.isActive) {
      return HttpResponse.json({
        isValid: false,
        errors: { code: 'NOT_APPLICABLE', message: 'This coupon is no longer active.' },
      })
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return HttpResponse.json({
        isValid: false,
        errors: { code: 'EXPIRED', message: 'This coupon has expired.', requirement: undefined },
      })
    }

    if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
      return HttpResponse.json({
        isValid: false,
        errors: { code: 'MAX_USES', message: 'This coupon has reached its maximum usage limit.' },
      })
    }

    if (coupon.minPurchase != null && cartTotal < coupon.minPurchase) {
      return HttpResponse.json({
        isValid: false,
        errors: { code: 'MIN_PURCHASE', message: `Minimum purchase of RM${coupon.minPurchase.toFixed(2)} required.`, requirement: coupon.minPurchase },
      })
    }

    let appliedAmount: number
    if (coupon.discountType === 'percentage') {
      appliedAmount = (cartTotal * coupon.discountValue) / 100
      if (coupon.maxDiscount != null && appliedAmount > coupon.maxDiscount) {
        appliedAmount = coupon.maxDiscount
      }
    } else {
      appliedAmount = coupon.discountValue
    }
    appliedAmount = Math.round(appliedAmount * 100) / 100

    return HttpResponse.json({
      isValid: true,
      discount: { type: coupon.discountType, value: coupon.discountValue, appliedAmount },
    })
  }),

  http.post('/api/checkout', async ({ request }) => {
    await sleep(300)
    const body = (await request.json()) as {
      items: Array<{ productId: string; productName: string; productImage: string; price: number; quantity: number }>
      subtotal: number
      discount: number
      shipping: number
      total: number
      couponCode?: string
      paymentMethod: { type: string }
      shippingAddress: Record<string, unknown>
    }

    const orderId = `ORD-${String(Date.now()).slice(-6)}`
    const order = db.order.create({
      id: orderId,
      items: body.items,
      subtotal: body.subtotal,
      discount: body.discount,
      shipping: body.shipping,
      total: body.total,
      couponCode: body.couponCode,
      paymentMethod: body.paymentMethod as { type: string },
      status: 'paid',
      shippingAddress: body.shippingAddress as Record<string, unknown>,
      createdAt: new Date().toISOString(),
    })

    db.cartItem.getAll().forEach((item) => {
      db.cartItem.delete({ where: { id: { equals: item.id } } })
    })

    if (body.couponCode) {
      const coupon = db.coupon.findFirst({ where: { code: { equals: body.couponCode } } })
      if (coupon) {
        db.coupon.update({
          where: { id: { equals: coupon.id } },
          data: { usageCount: coupon.usageCount + 1 },
        })
      }
    }

    return HttpResponse.json(order, { status: 201 })
  }),

  http.get('/api/checkout/:orderId/status', async ({ params }) => {
    await sleep()
    const order = db.order.findFirst({
      where: { id: { equals: params.orderId as string } },
    })
    if (!order) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ id: order.id, status: order.status })
  }),

  http.get('/api/admin/orders', async () => {
    await sleep()
    return HttpResponse.json(db.order.getAll())
  }),
]
