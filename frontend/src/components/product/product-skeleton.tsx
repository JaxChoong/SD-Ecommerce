import { Skeleton } from '../ui/skeleton'

export function ProductSkeleton() {
  return (
    <div className="flex flex-col bg-surface rounded-radius overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-1 flex-col p-4 gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-radius" />
        </div>
      </div>
    </div>
  )
}
