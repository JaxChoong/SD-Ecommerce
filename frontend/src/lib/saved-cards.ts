import type { SavedCreditCard } from '../types'

type RailsCard = Omit<SavedCreditCard, 'isDefault' | 'createdAt'> & {
  is_default: boolean
  created_at: string
}

const toCamel = (r: RailsCard): SavedCreditCard => ({
  id: String(r.id),
  brand: r.brand,
  last4: r.last4,
  expiry: r.expiry,
  holder: r.holder,
  isDefault: r.is_default,
  createdAt: r.created_at,
})

export const normalizeSavedCards = (data: unknown): SavedCreditCard[] => {
  if (!Array.isArray(data)) return []
  return data.map((item) => {
    const r = item as Partial<RailsCard> & Record<string, unknown>
    if (typeof r.is_default === 'boolean' || typeof r.created_at === 'string') {
      return toCamel({
        id: r.id ?? '',
        brand: r.brand ?? 'Visa',
        last4: r.last4 ?? '',
        expiry: r.expiry ?? '',
        holder: r.holder ?? '',
        is_default: r.is_default ?? false,
        created_at: r.created_at ?? new Date().toISOString(),
      } as RailsCard)
    }
    return item as SavedCreditCard
  })
}
