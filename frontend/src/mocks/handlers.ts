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
      discount: {
        type: coupon.discountType,
        value: coupon.discountValue,
        appliedAmount,
        target: (coupon.discountTarget || 'base_price') as 'base_price' | 'shipping'
      },
    })
  }),

  http.post('/api/checkout', async ({ request }) => {
    const body = (await request.json()) as { amount: number; method: string }
    await sleep(300)
    return HttpResponse.json({
      success: true,
      method: body.method,
      transaction_id: `MSW-${Date.now().toString().slice(-6)}`,
      processed_at: new Date().toISOString(),
    })
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

  http.get('/api/orders', async () => {
    await sleep()
    return HttpResponse.json(db.order.getAll())
  }),

  http.get('/api/addresses', async () => {
    await sleep()
    return HttpResponse.json(db.address.getAll())
  }),

  http.get('/api/saved-payment-methods', async () => {
    await sleep()
    const all = db.savedPaymentMethod.getAll()
    const sorted = [...all].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })
    return HttpResponse.json(sorted)
  }),

  http.post('/api/saved-payment-methods', async ({ request }) => {
    await sleep()
    const body = (await request.json()) as {
      brand: string
      last4: string
      expiry: string
      holder: string
      is_default?: boolean
    }

    const all = db.savedPaymentMethod.getAll()
    const wantsDefault = body.is_default === true || all.length === 0
    if (wantsDefault) {
      all.forEach((c) => db.savedPaymentMethod.update({
        where: { id: { equals: c.id } },
        data: { isDefault: false },
      }))
    }

    const record = db.savedPaymentMethod.create({
      id: crypto.randomUUID(),
      brand: body.brand,
      last4: body.last4,
      expiry: body.expiry,
      holder: body.holder,
      isDefault: wantsDefault,
      createdAt: new Date().toISOString(),
    })
    return HttpResponse.json(record, { status: 201 })
  }),

  http.delete('/api/saved-payment-methods/:id', async ({ params }) => {
    await sleep()
    const record = db.savedPaymentMethod.findFirst({
      where: { id: { equals: params.id as string } },
    })
    if (!record) return new HttpResponse(null, { status: 404 })
    const wasDefault = record.isDefault
    db.savedPaymentMethod.delete({ where: { id: { equals: record.id } } })

    if (wasDefault) {
      const remaining = db.savedPaymentMethod.getAll()
      const next = [...remaining].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return tb - ta
      })[0]
      if (next) {
        db.savedPaymentMethod.update({
          where: { id: { equals: next.id } },
          data: { isDefault: true },
        })
      }
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.patch('/api/saved-payment-methods/:id/default', async ({ params }) => {
    await sleep()
    const record = db.savedPaymentMethod.findFirst({
      where: { id: { equals: params.id as string } },
    })
    if (!record) return new HttpResponse(null, { status: 404 })
    db.savedPaymentMethod.getAll().forEach((c) => {
      if (c.id !== record.id) {
        db.savedPaymentMethod.update({
          where: { id: { equals: c.id } },
          data: { isDefault: false },
        })
      }
    })
    const updated = db.savedPaymentMethod.update({
      where: { id: { equals: record.id } },
      data: { isDefault: true },
    })
    return HttpResponse.json(updated)
  }),
]
