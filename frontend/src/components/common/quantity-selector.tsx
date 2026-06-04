import { Minus, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) {
  return (
    <div className={cn('flex items-center gap-0', className)}>
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-l-radius border border-border bg-surface text-foreground disabled:opacity-40 transition-colors hover:bg-surface/80"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="flex h-8 w-10 items-center justify-center border-y border-border text-sm font-medium leading-relaxed">
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-r-radius border border-border bg-surface text-foreground disabled:opacity-40 transition-colors hover:bg-surface/80"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
