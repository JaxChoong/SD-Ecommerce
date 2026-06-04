import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {}

export function ImageWithFallback({ className, alt, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={cn('flex items-center justify-center bg-surface text-muted-foreground', className)}>
        <span className="text-xs">{alt?.[0]?.toUpperCase() || '?'}</span>
      </div>
    )
  }

  return (
    <img
      className={cn('object-cover', className)}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  )
}
