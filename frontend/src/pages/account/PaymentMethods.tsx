import { useState, useEffect, useCallback } from 'react'
import { Container } from '../../components/layout/container'
import { Button } from '../../components/ui/button'
import { CreditCard, Trash2 } from 'lucide-react'
import type { SavedCreditCard } from '../../types'
import { normalizeSavedCards } from '../../lib/saved-cards'

export default function PaymentMethods() {
  const [cards, setCards] = useState<SavedCreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/saved-payment-methods')
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      setCards(normalizeSavedCards(await res.json()))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load saved payment methods.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCards()
  }, [fetchCards])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this saved card?')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/saved-payment-methods/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`)
      setCards((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete card.')
    } finally {
      setBusyId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/saved-payment-methods/${id}/default`, { method: 'PATCH' })
      if (!res.ok) throw new Error(`Set default failed (${res.status})`)
      setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not set default.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold mb-6">Payment Methods</h1>

      {error && (
        <p className="text-sm text-error mb-4" role="alert">{error}</p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="bg-surface rounded-radius p-4 animate-pulse">
              <div className="h-5 w-5 bg-muted rounded mb-2" />
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-surface rounded-radius p-6 text-center">
          <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-1">No saved payment methods.</p>
          <p className="text-xs text-muted-foreground">
            Tick &ldquo;Save card for future purchases&rdquo; at checkout to save one here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div key={card.id} className="bg-surface rounded-radius p-4 relative">
              {card.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
              <CreditCard className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="font-medium text-sm">{card.brand} •••• {card.last4}</p>
              <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
              <p className="text-xs text-muted-foreground mb-3">{card.holder}</p>
              <div className="flex items-center gap-3 text-xs">
                {!card.isDefault && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => handleSetDefault(card.id)}
                    disabled={busyId === card.id}
                  >
                    Make default
                  </Button>
                )}
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-error hover:no-underline"
                  onClick={() => handleDelete(card.id)}
                  disabled={busyId === card.id}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
