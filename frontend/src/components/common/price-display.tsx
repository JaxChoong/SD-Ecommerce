import { cn } from '../../lib/utils'

interface PriceDisplayProps {
  price: number
  originalPrice?: number
  className?: string
}

export function PriceDisplay({ price, originalPrice, className }: PriceDisplayProps) {
  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className="font-semibold">RM{price.toFixed(2)}</span>
      {originalPrice != null && originalPrice > price && (
        <span className="text-sm text-muted-foreground line-through">
          RM{originalPrice.toFixed(2)}
        </span>
      )}
    </div>
  )
}
