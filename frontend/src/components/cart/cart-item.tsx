import { Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '../../types'
import { ImageWithFallback } from '../common/image-with-fallback'
import { QuantitySelector } from '../common/quantity-selector'
import { useCart } from '../../context/CartContext'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex gap-3 p-3 sm:p-4 bg-surface rounded-radius">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-radius bg-surface-raised">
        <ImageWithFallback
          src={item.productImage}
          alt={item.productName}
          className="h-full w-full"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex justify-between gap-2">
          <h4 className="text-sm font-medium leading-relaxed truncate">{item.productName}</h4>
          <button
            onClick={() => removeItem(item.id)}
            className="text-muted-foreground hover:text-error transition-colors shrink-0"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          RM{item.price.toFixed(2)}
          {item.size && item.size !== 'One Size' ? ` · Size ${item.size}` : ''}
        </p>
        <div className="flex items-center justify-between">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => updateQuantity(item.id, q)}
          />
          <span className="text-sm font-medium">
            RM{(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
