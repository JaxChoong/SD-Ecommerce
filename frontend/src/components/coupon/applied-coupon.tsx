import { CheckCircle, X } from 'lucide-react'

interface AppliedCouponProps {
  code: string
  savings: number
  onRemove: () => void
}

export function AppliedCoupon({ code, savings, onRemove }: AppliedCouponProps) {
  return (
    <div className="flex items-center justify-between rounded-radius bg-success/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-success" />
        <div>
          <p className="text-sm font-medium leading-relaxed text-success">{code}</p>
          <p className="text-xs text-muted-foreground">-RM{savings.toFixed(2)} savings</p>
        </div>
      </div>
      <button onClick={onRemove} className="text-muted-foreground hover:text-error transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
